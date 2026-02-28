import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { NotificacoesService } from './services/notificacoes.service';
import { NotificacoesController } from './controllers/notificacoes.controller';
import { NotificacoesGateway } from './gateways/notificacoes.gateway';
import { Notificacao } from './entities/notificacao.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacao]),
    JwtModule.register({}),
  ],
  providers: [NotificacoesService, NotificacoesGateway],
  controllers: [NotificacoesController],
  exports: [NotificacoesService, NotificacoesGateway],
})
export class NotificacoesModule {}
