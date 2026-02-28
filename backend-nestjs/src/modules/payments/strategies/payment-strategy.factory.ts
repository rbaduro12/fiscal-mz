import { Injectable } from '@nestjs/common';
import { IPaymentStrategy } from './payment-strategy.interface';
import { MpesaStrategy } from './mpesa.strategy';
import { CashStrategy } from './cash.strategy';
import { CardStrategy } from './card.strategy';
import { EscrowStrategy } from './escrow.strategy';

@Injectable()
export class PaymentStrategyFactory {
  constructor(
    private readonly mpesaStrategy: MpesaStrategy,
    private readonly cashStrategy: CashStrategy,
    private readonly cardStrategy: CardStrategy,
    private readonly escrowStrategy: EscrowStrategy,
  ) {}

  getStrategy(method: string): IPaymentStrategy {
    switch (method.toUpperCase()) {
      case 'MPESA':
        return this.mpesaStrategy;
      case 'EMOLA':
        return this.mpesaStrategy; // Mesma implementação base
      case 'BIM':
        return this.mpesaStrategy;
      case 'CASH':
        return this.cashStrategy;
      case 'CARTAO_DEBITO':
      case 'CARTAO_CREDITO':
        return this.cardStrategy;
      case 'ESCROW':
        return this.escrowStrategy;
      default:
        throw new Error(`Método de pagamento não suportado: ${method}`);
    }
  }
}
