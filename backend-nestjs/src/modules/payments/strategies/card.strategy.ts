import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentStrategy, PaymentResult, PaymentMetadata } from './payment-strategy.interface';

@Injectable()
export class CardStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(CardStrategy.name);
  readonly method = 'CARTAO';

  constructor(private readonly configService: ConfigService) {}

  async processPayment(
    proformaId: string,
    amount: number,
    tenantId: string,
    clientId: string,
    metadata?: PaymentMetadata,
  ): Promise<PaymentResult> {
    this.logger.log(`Processando pagamento com cartão: ${amount} MZN`);

    // Integração com Stripe/PayPal (futuro)
    // Por enquanto retorna erro indicando que não está implementado
    return {
      success: false,
      status: 'FALHADO',
      message: 'Pagamento com cartão será disponibilizado em breve',
    };
  }

  async checkStatus(transactionId: string): Promise<PaymentResult> {
    return {
      success: false,
      transactionId,
      status: 'FALHADO',
      message: 'Não implementado',
    };
  }

  async handleWebhook(payload: any): Promise<PaymentResult> {
    return {
      success: false,
      status: 'FALHADO',
      message: 'Não implementado',
    };
  }
}
