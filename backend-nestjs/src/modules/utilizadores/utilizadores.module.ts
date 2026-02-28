import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilizador } from './entities/utilizador.entity';
import { UtilizadoresService } from './services/utilizadores.service';
import { UtilizadoresController } from './controllers/utilizadores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Utilizador])],
  providers: [UtilizadoresService],
  controllers: [UtilizadoresController],
  exports: [UtilizadoresService],
})
export class UtilizadoresModule {}
