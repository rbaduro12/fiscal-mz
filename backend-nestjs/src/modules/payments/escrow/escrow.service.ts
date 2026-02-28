import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PaymentResult } from '../strategies/payment-strategy.interface';

export interface EscrowTransaction {
  escrowId: string;
  proformaId: string;
  amount: number;
  tenantId: string;
  clientId: string;
  status: 'PENDENTE' | 'EM_ESCROW' | 'LIBERADO' | 'REEMBOLSADO' | 'EM_DISPUTA';
  createdAt: Date;
}

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);
  private readonly SYSTEM_ESCROW_TENANT_ID = 'SYSTEM_ESCROW';

  constructor(private readonly dataSource: DataSource) {}

  async initializeEscrow(
    proformaId: string,
    amount: number,
    tenantId: string,
    clientId: string,
  ): Promise<EscrowTransaction> {
    const escrowId = uuidv4();

    await this.dataSource.transaction(async (manager) => {
      // Criar registro de escrow
      await manager.query(
        `INSERT INTO escrow_transactions (
          id, proforma_id, tenant_id, client_id, amount, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, 'PENDENTE', NOW())`,
        [escrowId, proformaId, tenantId, clientId, amount]
      );

      // O dinheiro é transferido para conta escrow do sistema
      // Em produção, isso envolveria chamadas reais à API de pagamento
      this.logger.log(`Valor ${amount} MZN reservado em escrow: ${escrowId}`);
    });

    return {
      escrowId,
      proformaId,
      amount,
      tenantId,
      clientId,
      status: 'PENDENTE',
      createdAt: new Date(),
    };
  }

  async confirmDeposit(escrowId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE escrow_transactions SET status = 'EM_ESCROW', deposit_confirmed_at = NOW() WHERE id = $1`,
      [escrowId]
    );

    // Notificar vendedor
    this.logger.log(`Escrow ${escrowId}: Depósito confirmado, notificando vendedor`);
  }

  async releaseFunds(escrowId: string, confirmedBy: string): Promise<PaymentResult> {
    return this.dataSource.transaction(async (manager) => {
      const escrow = await manager.query(
        `SELECT * FROM escrow_transactions WHERE id = $1 AND status = 'EM_ESCROW'`,
        [escrowId]
      );

      if (!escrow.length) {
        throw new Error('Escrow não encontrado ou já processado');
      }

      const { tenant_id, amount } = escrow[0];

      // Transferir da conta escrow para wallet do vendedor
      await manager.query(
        `UPDATE tenants SET wallet_balance = wallet_balance + $1 WHERE id = $2`,
        [amount, tenant_id]
      );

      // Atualizar status
      await manager.query(
        `UPDATE escrow_transactions 
         SET status = 'LIBERADO', released_at = NOW(), released_by = $2 
         WHERE id = $1`,
        [escrowId, confirmedBy]
      );

      this.logger.log(`Escrow ${escrowId}: Fundos liberados para ${tenant_id}`);

      return {
        success: true,
        status: 'CONCLUIDO',
        message: 'Pagamento liberado para o vendedor',
      };
    });
  }

  async refundBuyer(escrowId: string, reason: string): Promise<PaymentResult> {
    await this.dataSource.query(
      `UPDATE escrow_transactions 
       SET status = 'REEMBOLSADO', refunded_at = NOW(), refund_reason = $2 
       WHERE id = $1`,
      [escrowId, reason]
    );

    this.logger.log(`Escrow ${escrowId}: Reembolso processado - ${reason}`);

    return {
      success: true,
      status: 'REEMBOLSADO',
      message: 'Pagamento reembolsado ao comprador',
    };
  }

  async openDispute(escrowId: string, reason: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE escrow_transactions 
       SET status = 'EM_DISPUTA', dispute_reason = $2, disputed_at = NOW() 
       WHERE id = $1`,
      [escrowId, reason]
    );

    this.logger.log(`Escrow ${escrowId}: Disputa aberta - ${reason}`);
    // Criar ticket de suporte
  }

  async checkEscrowStatus(escrowId: string): Promise<PaymentResult> {
    const result = await this.dataSource.query(
      `SELECT status FROM escrow_transactions WHERE id = $1`,
      [escrowId]
    );

    if (!result.length) {
      return {
        success: false,
        status: 'FALHADO',
        message: 'Escrow não encontrado',
      };
    }

    const statusMap: Record<string, string> = {
      'PENDENTE': 'PROCESSANDO',
      'EM_ESCROW': 'PROCESSANDO',
      'LIBERADO': 'CONCLUIDO',
      'REEMBOLSADO': 'REEMBOLSADO',
      'EM_DISPUTA': 'PENDENTE',
    };

    return {
      success: true,
      transactionId: escrowId,
      status: statusMap[result[0].status] as any,
      message: `Status escrow: ${result[0].status}`,
    };
  }

  async processEscrowEvent(payload: any): Promise<PaymentResult> {
    const { escrowId, eventType, data } = payload;

    switch (eventType) {
      case 'DEPOSIT_CONFIRMED':
        await this.confirmDeposit(escrowId);
        return { success: true, status: 'PROCESSANDO', message: 'Depósito confirmado' };
      
      case 'DELIVERY_CONFIRMED':
        return this.releaseFunds(escrowId, data.confirmedBy);
      
      case 'DISPUTE_OPENED':
        await this.openDispute(escrowId, data.reason);
        return { success: true, status: 'PENDENTE', message: 'Disputa em análise' };
      
      default:
        throw new Error(`Evento de escrow desconhecido: ${eventType}`);
    }
  }

  /**
   * Auto-liberação após 48h se comprador não reclamar
   */
  async autoReleaseExpiredEscrows(): Promise<void> {
    const expiredEscrows = await this.dataSource.query(
      `SELECT id, tenant_id FROM escrow_transactions 
       WHERE status = 'EM_ESCROW' 
       AND deposit_confirmed_at < NOW() - INTERVAL '48 hours'
       AND auto_release_processed = false`
    );

    for (const escrow of expiredEscrows) {
      try {
        await this.releaseFunds(escrow.id, 'SYSTEM_AUTO');
        await this.dataSource.query(
          `UPDATE escrow_transactions SET auto_release_processed = true WHERE id = $1`,
          [escrow.id]
        );
      } catch (error) {
        this.logger.error(`Erro auto-release escrow ${escrow.id}: ${error.message}`);
      }
    }
  }
}
