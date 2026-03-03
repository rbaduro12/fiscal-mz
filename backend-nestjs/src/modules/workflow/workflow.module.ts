import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from '../documentos/entities/documento.entity';
import { LinhaDocumento } from '../documentos/entities/linha-documento.entity';
import { Entidade } from '../entidades/entities/entidade.entity';
import { Artigo } from '../artigos/entities/artigo.entity';
import { Notificacao } from '../notificacoes/entities/notificacao.entity';
import { DocumentoWorkflowService } from './services/documento-workflow.service';
import { WorkflowIntegracaoService } from './services/workflow-integracao.service';
import { WorkflowController } from './controllers/workflow.controller';
import { StockModule } from '../stock/stock.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documento, LinhaDocumento, Entidade, Artigo, Notificacao]),
    StockModule,
    NotificacoesModule,
  ],
  providers: [DocumentoWorkflowService, WorkflowIntegracaoService],
  controllers: [WorkflowController],
  exports: [DocumentoWorkflowService, WorkflowIntegracaoService],
})
export class WorkflowModule {}
