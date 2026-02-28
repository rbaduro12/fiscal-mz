import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IvaReportService } from './services/iva-report.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { IvaReportController } from './controllers/iva-report.controller';
import { DeclaracaoIVA } from './entities/declaracao-iva.entity';
import { Documento } from '../documentos/entities/documento.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { EmpresasService } from '../empresas/services/empresas.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeclaracaoIVA, Documento, Empresa])],
  providers: [
    IvaReportService,
    PdfGeneratorService,
    EmpresasService,
    Logger,
  ],
  controllers: [IvaReportController],
  exports: [IvaReportService, PdfGeneratorService],
})
export class FiscalModule {}
