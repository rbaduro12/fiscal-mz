import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentsController } from './payments.controller';

// Strategies
import { MpesaStrategy } from './strategies/mpesa.strategy';
import { CashStrategy } from './strategies/cash.strategy';
import { CardStrategy } from './strategies/card.strategy';
import { EscrowStrategy } from './strategies/escrow.strategy';
import { PaymentStrategyFactory } from './strategies/payment-strategy.factory';

// Services
import { PaymentOrchestrator } from './services/payment-orchestrator.service';
import { EscrowService } from './escrow/escrow.service';

// Handlers
import { ProcessPaymentHandler } from './commands/handlers/process-payment.handler';
import { ConfirmPaymentHandler } from './commands/handlers/confirm-payment.handler';
import { PaymentConfirmedHandler } from './events/handlers/payment-confirmed.handler';

const CommandHandlers = [ProcessPaymentHandler, ConfirmPaymentHandler];
const EventHandlers = [PaymentConfirmedHandler];
const Strategies = [MpesaStrategy, CashStrategy, CardStrategy, EscrowStrategy];

@Module({
  imports: [CqrsModule],
  controllers: [PaymentsController],
  providers: [
    ...CommandHandlers,
    ...EventHandlers,
    ...Strategies,
    PaymentStrategyFactory,
    PaymentOrchestrator,
    EscrowService,
  ],
  exports: [PaymentOrchestrator, EscrowService],
})
export class PaymentsModule {}
