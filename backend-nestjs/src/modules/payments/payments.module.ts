import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pagamento } from './entities/pagamento.entity';
import { PagamentosService } from './services/pagamentos.service';
import { PagamentosController } from './controllers/pagamentos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pagamento])],
  providers: [PagamentosService],
  controllers: [PagamentosController],
  exports: [PagamentosService],
})
export class PaymentsModule {}
