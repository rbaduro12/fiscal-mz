import { CommandHandler, ICommandHandler, EventBus, CommandBus } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AcceptQuoteCommand } from '../impl/accept-quote.command';
import { GenerateProformaCommand } from '../impl/generate-proforma.command';
import { QuoteAcceptedEvent } from '../../events/impl/quote-accepted.event';
import { QuoteNegotiatingEvent } from '../../events/impl/quote-negotiating.event';

@CommandHandler(AcceptQuoteCommand)
export class AcceptQuoteHandler implements ICommandHandler<AcceptQuoteCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: AcceptQuoteCommand): Promise<void> {
    const { quoteId, tenantId, userId, negotiatedItems } = command;

    // 1. Buscar cotação atual
    const quote = await this.dataSource.query(
      `SELECT * FROM workflow_negociacoes WHERE id = $1 AND tenant_id = $2`,
      [quoteId, tenantId]
    );

    if (!quote.length) {
      throw new NotFoundException('Cotação não encontrada');
    }

    const currentQuote = quote[0];

    // 2. Validar status
    if (!['ENVIADA', 'NEGOCIANDO'].includes(currentQuote.status)) {
      throw new BadRequestException(`Cotação não pode ser aceita. Status atual: ${currentQuote.status}`);
    }

    // 3. Se há contra-proposta
    if (negotiatedItems?.length) {
      return this.handleNegotiation(currentQuote, negotiatedItems, userId);
    }

    // 4. Aceitar diretamente
    await this.handleAcceptance(currentQuote, userId);
  }

  private async handleNegotiation(quote: any, negotiatedItems: any[], userId: string): Promise<void> {
    const historicoEntry = {
      data: new Date().toISOString(),
      autor_id: userId,
      autor_tipo: 'COMPRADOR',
      tipo: 'COUNTER_OFFER',
      itens_negociados: negotiatedItems,
    };

    await this.dataSource.transaction(async (manager) => {
      // Atualizar cotação
      await manager.query(
        `UPDATE workflow_negociacoes 
         SET status = 'NEGOCIANDO', 
             historico_negociacao = historico_negociacao || $1::jsonb,
             updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify([historicoEntry]), quote.id]
      );

      // Event store
      await manager.query(
        `INSERT INTO event_store (id, aggregate_id, aggregate_type, aggregate_version, event_type, payload, metadata, tenant_id, occurred_on, published)
         VALUES ($1, $2, $3, (SELECT COALESCE(MAX(aggregate_version), 0) + 1 FROM event_store WHERE aggregate_id = $2), $4, $5, $6, $7, NOW(), false)`,
        [
          uuidv4(), quote.id, 'Quote', 'QuoteNegotiatingEvent',
          JSON.stringify({ quoteId: quote.id, negotiatedItems, historicoEntry }),
          JSON.stringify({ tenantId: quote.tenant_id, userId }), quote.tenant_id,
        ]
      );
    });

    // Notificar vendedor
    this.eventBus.publish(new QuoteNegotiatingEvent(quote.id, quote.tenant_id, quote.cliente_id));
  }

  private async handleAcceptance(quote: any, userId: string): Promise<void> {
    const historicoEntry = {
      data: new Date().toISOString(),
      autor_id: userId,
      autor_tipo: 'COMPRADOR',
      tipo: 'ACEITE',
    };

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `UPDATE workflow_negociacoes 
         SET status = 'ACEITE', 
             historico_negociacao = historico_negociacao || $1::jsonb,
             updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify([historicoEntry]), quote.id]
      );

      await manager.query(
        `INSERT INTO event_store (id, aggregate_id, aggregate_type, aggregate_version, event_type, payload, metadata, tenant_id, occurred_on, published)
         VALUES ($1, $2, $3, (SELECT COALESCE(MAX(aggregate_version), 0) + 1 FROM event_store WHERE aggregate_id = $2), $4, $5, $6, $7, NOW(), false)`,
        [
          uuidv4(), quote.id, 'Quote', 'QuoteAcceptedEvent',
          JSON.stringify({ quoteId: quote.id, historicoEntry }),
          JSON.stringify({ tenantId: quote.tenant_id, userId }), quote.tenant_id,
        ]
      );
    });

    // Emitir evento
    this.eventBus.publish(new QuoteAcceptedEvent(quote.id, quote.tenant_id, quote.cliente_id, quote.total_estimado));

    // Trigger automático: Gerar Proforma
    await this.commandBus.execute(new GenerateProformaCommand(quote.id, quote.tenant_id));
  }
}
