import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacao } from './entities/notificacao.entity';
import { NotificacoesService } from './services/notificacoes.service';
import { NotificacoesController } from './controllers/notificacoes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacao])],
  providers: [NotificacoesService],
  controllers: [NotificacoesController],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}
