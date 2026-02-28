import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FiscalController } from './fiscal.controller';

// Commands
import { EmitInvoiceHandler } from './commands/handlers/emit-invoice.handler';
import { CancelInvoiceHandler } from './commands/handlers/cancel-invoice.handler';

// Events
import { InvoiceEmittedHandler } from './events/handlers/invoice-emitted.handler';

// Domain
import { InvoiceAggregateRepository } from './domain/invoice-aggregate.repository';
import { FiscalNumberGenerator } from './domain/fiscal-number-generator.service';
import { HashGenerator } from './domain/hash-generator.service';

const CommandHandlers = [EmitInvoiceHandler, CancelInvoiceHandler];
const EventHandlers = [InvoiceEmittedHandler];

@Module({
  imports: [CqrsModule],
  controllers: [FiscalController],
  providers: [
    ...CommandHandlers,
    ...EventHandlers,
    InvoiceAggregateRepository,
    FiscalNumberGenerator,
    HashGenerator,
  ],
  exports: [EmitInvoiceHandler, InvoiceAggregateRepository],
})
export class FiscalModule {}
