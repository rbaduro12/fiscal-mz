import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { GenerateProformaCommand } from '../impl/generate-proforma.command';
import { ProformaGeneratedEvent } from '../../events/impl/proforma-generated.event';

@CommandHandler(GenerateProformaCommand)
export class GenerateProformaHandler implements ICommandHandler<GenerateProformaCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: GenerateProformaCommand): Promise<{ proformaId: string; numeroProforma: string }> {
    const { quoteId, tenantId, condicoesPagamento } = command;

    // 1. Buscar cotação aceite
    const quote = await this.dataSource.query(
      `SELECT * FROM workflow_negociacoes WHERE id = $1 AND tenant_id = $2 AND status = 'ACEITE'`,
      [quoteId, tenantId]
    );

    if (!quote.length) {
      throw new NotFoundException('Cotação aceite não encontrada');
    }

    const currentQuote = quote[0];

    // 2. Verificar se já existe proforma
    const existingProforma = await this.dataSource.query(
      `SELECT id FROM proformas WHERE cotacao_id = $1 AND status NOT IN ('CANCELADA', 'VENCIDA')`,
      [quoteId]
    );

    if (existingProforma.length) {
      throw new BadRequestException('Já existe uma proforma ativa para esta cotação');
    }

    // 3. Gerar número de proforma
    const numeroProforma = await this.generateProformaNumber(tenantId);

    // 4. Definir condições de pagamento
    const condicao = condicoesPagamento || await this.getDefaultPaymentCondition(tenantId);

    // 5. Criar proforma
    const proformaId = uuidv4();
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 30);

    await this.dataSource.transaction(async (manager) => {
      // Criar proforma
      await manager.query(
        `INSERT INTO proformas (
          id, cotacao_id, tenant_id, cliente_id, numero_proforma, ano_proforma,
          data_emissao, data_vencimento, itens, subtotal, total_descontos, total_iva, total_geral,
          condicoes_pagamento, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, $9, $10, $11, $12, $13, 'PENDENTE', NOW(), NOW())`,
        [
          proformaId, quoteId, tenantId, currentQuote.cliente_id, numeroProforma,
          new Date().getFullYear(), dataVencimento, currentQuote.itens,
          currentQuote.subtotal, currentQuote.total_descontos, currentQuote.total_iva,
          currentQuote.total_estimado, condicao
        ]
      );

      // Atualizar cotação
      await manager.query(
        `UPDATE workflow_negociacoes SET status = 'CONVERTIDA', conversao_documento_id = $1, updated_at = NOW() WHERE id = $2`,
        [proformaId, quoteId]
      );

      // Event store
      await manager.query(
        `INSERT INTO event_store (id, aggregate_id, aggregate_type, aggregate_version, event_type, payload, metadata, tenant_id, occurred_on, published)
         VALUES ($1, $2, $3, 1, $4, $5, $6, $7, NOW(), false)`,
        [
          uuidv4(), proformaId, 'Proforma', 'ProformaGeneratedEvent',
          JSON.stringify({ proformaId, quoteId, tenantId, numeroProforma, condicoesPagamento: condicao, total: currentQuote.total_estimado }),
          JSON.stringify({ tenantId }), tenantId,
        ]
      );

      // Se é ESCROW, criar registro de pagamento pendente
      if (condicao === 'ESCROW') {
        await manager.query(
          `INSERT INTO pagamentos (id, tenant_id, cliente_id, proforma_id, metodo, valor, estado, is_escrow, created_at)
           VALUES ($1, $2, $3, $4, 'ESCROW', $5, 'PENDENTE', true, NOW())`,
          [uuidv4(), tenantId, currentQuote.cliente_id, proformaId, currentQuote.total_estimado]
        );
      }
    });

    // Emitir evento
    this.eventBus.publish(new ProformaGeneratedEvent(proformaId, tenantId, currentQuote.cliente_id, numeroProforma, currentQuote.total_estimado));

    return { proformaId, numeroProforma };
  }

  private async generateProformaNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const result = await this.dataSource.query(
      `SELECT COALESCE(MAX(contador_proforma), 0) + 1 as next_num 
       FROM tenants 
       WHERE id = $1`,
      [tenantId]
    );
    
    const num = result[0]?.next_num || 1;
    
    // Atualizar contador
    await this.dataSource.query(
      `UPDATE tenants SET contador_proforma = $1 WHERE id = $2`,
      [num, tenantId]
    );
    
    return `P/${year}/${num}`;
  }

  private async getDefaultPaymentCondition(tenantId: string): Promise<string> {
    const result = await this.dataSource.query(
      `SELECT configuracoes_pagamento->>'prazo_padrao_dias' as prazo FROM tenants WHERE id = $1`,
      [tenantId]
    );
    
    const prazo = parseInt(result[0]?.prazo);
    if (prazo === 0) return 'IMMEDIATO';
    if (prazo === 30) return '30_DIAS';
    return '30_DIAS';
  }
}
