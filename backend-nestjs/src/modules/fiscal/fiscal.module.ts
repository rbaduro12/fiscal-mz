import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IvaReportService } from './services/iva-report.service';
import { IvaReportController } from './controllers/iva-report.controller';
import { DeclaracaoIVA } from './entities/declaracao-iva.entity';
import { Documento } from '../documentos/entities/documento.entity';
import { Empresa } from '../empresas/entities/empresa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeclaracaoIVA, Documento, Empresa])],
  providers: [IvaReportService],
  controllers: [IvaReportController],
  exports: [IvaReportService],
})
export class FiscalModule {}
