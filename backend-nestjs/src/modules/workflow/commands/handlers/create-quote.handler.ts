import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateQuoteCommand } from '../impl/create-quote.command';
import { QuoteCreatedEvent } from '../../events/impl/quote-created.event';

interface QuoteItem {
  produtoId: string;
  descricao: string;
  quantidade: number;
  precoUnit: number;
  descontoPercent: number;
  ivaPercent: number;
  totalLinha: number;
}

@CommandHandler(CreateQuoteCommand)
export class CreateQuoteHandler implements ICommandHandler<CreateQuoteCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: CreateQuoteCommand): Promise<{ quoteId: string; numeroCotacao: string }> {
    const { tenantId, clientId, items, validityDays, createdBy } = command;

    // 1. Validar itens
    this.validateItems(items);

    // 2. Calcular totais
    const calculatedItems = this.calculateItems(items);
    const totais = this.calculateTotals(calculatedItems);

    // 3. Gerar número de cotação
    const numeroCotacao = await this.generateQuoteNumber(tenantId);

    // 4. Criar cotação em transação
    const quoteId = uuidv4();
    const validadeAte = new Date();
    validadeAte.setDate(validadeAte.getDate() + (validityDays || 30));

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO workflow_negociacoes (
          id, tenant_id, cliente_id, status, itens, 
          subtotal, total_descontos, total_iva, total_estimado,
          validade_ate, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          quoteId, tenantId, clientId, 'RASCUNHO', JSON.stringify(calculatedItems),
          totais.subtotal, totais.totalDescontos, totais.totalIva, totais.totalGeral,
          validadeAte, createdBy,
        ]
      );

      await manager.query(
        `INSERT INTO event_store (
          id, aggregate_id, aggregate_type, aggregate_version, event_type, 
          payload, metadata, tenant_id, occurred_on, published
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), false)`,
        [
          uuidv4(), quoteId, 'Quote', 1, 'QuoteCreatedEvent',
          JSON.stringify({ quoteId, tenantId, clientId, numeroCotacao, items: calculatedItems, totais, validadeAte: validadeAte.toISOString() }),
          JSON.stringify({ tenantId, userId: createdBy }), tenantId,
        ]
      );
    });

    this.eventBus.publish(new QuoteCreatedEvent(quoteId, tenantId, clientId, numeroCotacao, totais.totalGeral));

    return { quoteId, numeroCotacao };
  }

  private validateItems(items: any[]): void {
    if (!items?.length) throw new BadRequestException('Cotação deve ter pelo menos um item');
    for (const item of items) {
      if (item.quantidade <= 0) throw new BadRequestException(`Quantidade inválida: ${item.descricao}`);
      if (item.precoUnit <= 0) throw new BadRequestException(`Preço inválido: ${item.descricao}`);
    }
  }

  private calculateItems(items: any[]): QuoteItem[] {
    return items.map(item => {
      const descontoPercent = item.descontoPercent || 0;
      const ivaPercent = item.ivaPercent || 16;
      const subtotal = item.quantidade * item.precoUnit;
      const descontoValor = subtotal * (descontoPercent / 100);
      const baseIva = subtotal - descontoValor;
      const ivaValor = baseIva * (ivaPercent / 100);
      return { ...item, descontoPercent, ivaPercent, totalLinha: Math.round((baseIva + ivaValor) * 100) / 100 };
    });
  }

  private calculateTotals(items: QuoteItem[]) {
    const subtotal = items.reduce((sum, i) => sum + (i.quantidade * i.precoUnit), 0);
    const totalDescontos = items.reduce((sum, i) => sum + ((i.quantidade * i.precoUnit) * (i.descontoPercent / 100)), 0);
    const totalIva = items.reduce((sum, i) => sum + (((i.quantidade * i.precoUnit) * (1 - i.descontoPercent/100)) * (i.ivaPercent/100)), 0);
    return { subtotal, totalDescontos, totalIva, totalGeral: subtotal - totalDescontos + totalIva };
  }

  private async generateQuoteNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const result = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM workflow_negociacoes WHERE tenant_id = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
      [tenantId, year]
    );
    return `C/${year}/${(parseInt(result[0].count) + 1).toString().padStart(4, '0')}`;
  }
}
