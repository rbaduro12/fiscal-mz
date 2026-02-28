import { Injectable, Logger } from '@nestjs/common';
import { IPaymentStrategy, PaymentResult, PaymentMetadata } from './payment-strategy.interface';

@Injectable()
export class CashStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(CashStrategy.name);
  readonly method = 'CASH';

  async processPayment(
    proformaId: string,
    amount: number,
    tenantId: string,
    clientId: string,
    metadata?: PaymentMetadata,
  ): Promise<PaymentResult> {
    this.logger.log(`Registrando pagamento em dinheiro: ${amount} MZN para proforma ${proformaId}`);

    // Pagamento em cash fica pendente de confirmação pelo vendedor
    return {
      success: true,
      status: 'PENDENTE',
      message: 'Aguardando confirmação do vendedor',
      instructions: 'O vendedor deve confirmar o recebimento do dinheiro',
    };
  }

  async checkStatus(): Promise<PaymentResult> {
    return {
      success: true,
      status: 'PENDENTE',
      message: 'Aguardando confirmação manual',
    };
  }

  async handleWebhook(): Promise<PaymentResult> {
    // Cash não tem webhook
    throw new Error('Cash payments do not support webhooks');
  }
}
