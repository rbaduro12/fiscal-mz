import { Injectable, Logger } from '@nestjs/common';
import { IPaymentStrategy, PaymentResult, PaymentMetadata } from './payment-strategy.interface';
import { EscrowService } from '../escrow/escrow.service';

@Injectable()
export class EscrowStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(EscrowStrategy.name);
  readonly method = 'ESCROW';

  constructor(private readonly escrowService: EscrowService) {}

  async processPayment(
    proformaId: string,
    amount: number,
    tenantId: string,
    clientId: string,
    metadata?: PaymentMetadata,
  ): Promise<PaymentResult> {
    this.logger.log(`Iniciando pagamento em escrow: ${amount} MZN para proforma ${proformaId}`);

    // Inicializar transação escrow
    const escrowResult = await this.escrowService.initializeEscrow(
      proformaId,
      amount,
      tenantId,
      clientId,
    );

    return {
      success: true,
      transactionId: escrowResult.escrowId,
      status: 'PROCESSANDO',
      message: 'Pagamento em garantia iniciado',
      instructions: 'O valor será retido até a confirmação de entrega',
    };
  }

  async checkStatus(escrowId: string): Promise<PaymentResult> {
    return this.escrowService.checkEscrowStatus(escrowId);
  }

  async handleWebhook(payload: any): Promise<PaymentResult> {
    // Escrow usa eventos internos ao invés de webhooks externos
    return this.escrowService.processEscrowEvent(payload);
  }
}
