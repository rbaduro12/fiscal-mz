import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from '../documentos/entities/documento.entity';
import { LinhaDocumento } from '../documentos/entities/linha-documento.entity';
import { Notificacao } from '../notificacoes/entities/notificacao.entity';
import { DocumentoWorkflowService } from './services/documento-workflow.service';
import { WorkflowController } from './controllers/workflow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Documento, LinhaDocumento, Notificacao])],
  providers: [DocumentoWorkflowService],
  controllers: [WorkflowController],
  exports: [DocumentoWorkflowService],
})
export class WorkflowModule {}
