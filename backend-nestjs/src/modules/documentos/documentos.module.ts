import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from './entities/documento.entity';
import { LinhaDocumento } from './entities/linha-documento.entity';
import { DocumentosService } from './services/documentos.service';
import { DocumentosController } from './controllers/documentos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Documento, LinhaDocumento])],
  providers: [DocumentosService],
  controllers: [DocumentosController],
  exports: [DocumentosService],
})
export class DocumentosModule {}
