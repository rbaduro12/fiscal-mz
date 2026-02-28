import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './workflow.controller';

// Commands
import { CreateQuoteHandler } from './commands/handlers/create-quote.handler';
import { AcceptQuoteHandler } from './commands/handlers/accept-quote.handler';
import { GenerateProformaHandler } from './commands/handlers/generate-proforma.handler';
import { SendQuoteHandler } from './commands/handlers/send-quote.handler';

// Events
import { QuoteCreatedHandler } from './events/handlers/quote-created.handler';
import { QuoteAcceptedHandler } from './events/handlers/quote-accepted.handler';
import { ProformaGeneratedHandler } from './events/handlers/proforma-generated.handler';

// Queries
import { GetPendingQuotesHandler } from './queries/handlers/get-pending-quotes.handler';
import { GetReceivedQuotesHandler } from './queries/handlers/get-received-quotes.handler';
import { GetQuoteByIdHandler } from './queries/handlers/get-quote-by-id.handler';

// Services
import { QuoteAggregateService } from './services/quote-aggregate.service';
import { ProformaNumberGenerator } from './services/proforma-number-generator.service';

const CommandHandlers = [
  CreateQuoteHandler,
  AcceptQuoteHandler,
  GenerateProformaHandler,
  SendQuoteHandler,
];

const EventHandlers = [
  QuoteCreatedHandler,
  QuoteAcceptedHandler,
  ProformaGeneratedHandler,
];

const QueryHandlers = [
  GetPendingQuotesHandler,
  GetReceivedQuotesHandler,
  GetQuoteByIdHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([])],
  controllers: [WorkflowController],
  providers: [
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
    QuoteAggregateService,
    ProformaNumberGenerator,
  ],
  exports: [QuoteAggregateService, ProformaNumberGenerator],
})
export class WorkflowModule {}
