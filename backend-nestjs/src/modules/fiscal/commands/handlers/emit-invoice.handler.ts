import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmitInvoiceCommand } from '../impl/emit-invoice.command';
import { InvoiceEmittedEvent } from '../../events/impl/invoice-emitted.event';
import { FiscalNumberGenerator } from '../../domain/fiscal-number-generator.service';
import { HashGenerator } from '../../domain/hash-generator.service';
import { InvoiceAggregate } from '../../domain/invoice-aggregate';

@CommandHandler(EmitInvoiceCommand)
export class EmitInvoiceHandler implements ICommandHandler<EmitInvoiceCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly dataSource: DataSource,
    private readonly numberGenerator: FiscalNumberGenerator,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute(command: EmitInvoiceCommand): Promise<{ invoiceId: string; numeroDocumento: string }> {
    const { proformaId, tenantId, userId, isEscrowRelease } = command;

    // 1. Buscar proforma paga
    const proforma = await this.dataSource.query(
      `SELECT * FROM proformas WHERE id = $1 AND (tenant_id = $2 OR $3 = true)`,
      [proformaId, tenantId, isEscrowRelease]
    );

    if (!proforma.length) {
      throw new NotFoundException('Proforma não encontrada');
    }

    const currentProforma = proforma[0];

    // 2. Validar se já foi convertida
    if (currentProforma.status !== 'PAGA' && !isEscrowRelease) {
      throw new BadRequestException('Proforma deve estar paga para gerar fatura fiscal');
    }

    // 3. Verificar se já existe fatura
    const existingInvoice = await this.dataSource.query(
      `SELECT id FROM documentos_fiscais WHERE proforma_origin_id = $1`,
      [proformaId]
    );

    if (existingInvoice.length) {
      throw new BadRequestException('Fatura já foi gerada para esta proforma');
    }

    // 4. Buscar dados do tenant para hash
    const tenant = await this.dataSource.query(
      `SELECT nif, nome FROM tenants WHERE id = $1`,
      [currentProforma.tenant_id]
    );

    // 5. Gerar número de fatura (SERIALIZABLE para garantir sequência)
    let numeroDocumento: string;
    await this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      numeroDocumento = await this.numberGenerator.generate('FT', currentProforma.tenant_id, manager);
    });

    // 6. Calcular IVA final (pode haver diferença de centavos)
    const itens = currentProforma.itens;
    const totaisCalculados = this.calculateTotals(itens);

    // Validar diferença
    const diferenca = Math.abs(totaisCalculados.totalGeral - currentProforma.total_geral);
    if (diferenca > 0.05) {
      throw new BadRequestException(
        `Diferença de valores detectada: ${diferenca.toFixed(2)} MZN. Revisão manual necessária.`
      );
    }

    // 7. Gerar hash
    const hash = this.hashGenerator.generate({
      tipo: 'FT',
      numero: numeroDocumento,
      data: new Date().toISOString(),
      total: totaisCalculados.totalGeral,
      nif: tenant[0]?.nif || '',
    });

    // 8. Buscar pagamento associado
    const pagamento = await this.dataSource.query(
      `SELECT id FROM pagamentos WHERE proforma_id = $1 AND estado = 'CONCLUIDO'`,
      [proformaId]
    );

    // 9. Criar aggregate e aplicar evento
    const invoiceId = await this.dataSource.transaction(async (manager) => {
      const id = await this.persistInvoice(
        manager,
        currentProforma,
        numeroDocumento,
        totaisCalculados,
        hash,
        pagamento[0]?.id,
      );

      // Salvar evento no event store
      const aggregate = new InvoiceAggregate();
      aggregate.emitirFatura(
        currentProforma.tenant_id,
        currentProforma.cliente_id,
        proformaId,
        numeroDocumento,
        itens,
        totaisCalculados,
        hash,
        pagamento[0]?.id,
      );

      for (const event of aggregate.getUncommittedEvents()) {
        await manager.query(
          `INSERT INTO event_store (id, aggregate_id, aggregate_type, aggregate_version, event_type, payload, metadata, tenant_id, occurred_on, published)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), false)`,
          [
            require('uuid').v4(),
            id,
            'Invoice',
            aggregate.version,
            event.type,
            JSON.stringify(event.payload),
            JSON.stringify({ tenantId, userId }),
            tenantId,
          ]
        );
      }

      return id;
    });

    // 10. Emitir evento para notificações
    this.eventBus.publish(
      new InvoiceEmittedEvent(
        invoiceId,
        currentProforma.tenant_id,
        currentProforma.cliente_id,
        numeroDocumento,
        totaisCalculados.totalGeral,
      )
    );

    return { invoiceId, numeroDocumento };
  }

  private calculateTotals(itens: any[]) {
    const subtotal = itens.reduce((sum, i) => sum + (i.quantidade * i.precoUnit), 0);
    const totalDescontos = itens.reduce((sum, i) => sum + ((i.quantidade * i.precoUnit) * (i.descontoPercent / 100)), 0);
    const totalIva = itens.reduce((sum, i) => sum + (((i.quantidade * i.precoUnit) * (1 - i.descontoPercent/100)) * (i.ivaPercent/100)), 0);
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalDescontos: Math.round(totalDescontos * 100) / 100,
      totalIva: Math.round(totalIva * 100) / 100,
      totalGeral: Math.round((subtotal - totalDescontos + totalIva) * 100) / 100,
    };
  }

  private async persistInvoice(
    manager: any,
    proforma: any,
    numeroDocumento: string,
    totais: any,
    hash: string,
    pagamentoId?: string,
  ): Promise<string> {
    const id = require('uuid').v4();
    const anoFiscal = new Date().getFullYear();

    await manager.query(
      `INSERT INTO documentos_fiscais (
        id, tenant_id, cliente_id, proforma_origin_id, tipo, numero_documento, ano_fiscal,
        data_emissao, itens, subtotal, total_descontos, total_iva, total_geral,
        hash_documento, estado_pagamento, pagamento_integrado, estado, created_at
      ) VALUES ($1, $2, $3, $4, 'FT', $5, $6, CURRENT_DATE, $7, $8, $9, $10, $11, $12, $13, true, 'ATIVO', NOW())`,
      [
        id, proforma.tenant_id, proforma.cliente_id, proforma.id,
        numeroDocumento, anoFiscal, JSON.stringify(proforma.itens),
        totais.subtotal, totais.totalDescontos, totais.totalIva, totais.totalGeral,
        hash, pagamentoId ? 'PAGO' : 'PENDENTE',
      ]
    );

    return id;
  }
}
