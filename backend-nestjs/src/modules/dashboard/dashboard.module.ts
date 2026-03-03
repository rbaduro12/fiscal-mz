import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { Documento } from '../documentos/entities/documento.entity';
import { DeclaracaoIVA } from '../fiscal/entities/declaracao-iva.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documento, DeclaracaoIVA]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
