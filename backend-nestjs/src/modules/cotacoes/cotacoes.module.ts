import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cotacao } from './entities/cotacao.entity';
import { ItemCotacao } from './entities/item-cotacao.entity';
import { EventStore } from './entities/event-store.entity';
import { CotacoesController } from './controllers/cotacoes.controller';
import { CotacoesService } from './services/cotacoes.service';
import { CreateQuoteHandler } from './commands/handlers/create-quote.handler';
import { AcceptQuoteHandler } from './commands/handlers/accept-quote.handler';
import { GenerateProformaHandler } from './commands/handlers/generate-proforma.handler';
import { PaymentOrchestrator } from './services/payment-orchestrator.service';
import { Documento } from '../documentos/entities/documento.entity';
import { Pagamento } from '../payments/entities/pagamento.entity';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';
import { Artigo } from '../artigos/entities/artigo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cotacao,
      ItemCotacao,
      EventStore,
      Documento,
      Pagamento,
      Artigo,
    ]),
    NotificacoesModule,
  ],
  controllers: [CotacoesController],
  providers: [
    CotacoesService,
    CreateQuoteHandler,
    AcceptQuoteHandler,
    GenerateProformaHandler,
    PaymentOrchestrator,
  ],
  exports: [CotacoesService],
})
export class CotacoesModule {}
