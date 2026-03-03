import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificacoesService } from './services/notificacoes.service';
import { NotificacoesController } from './controllers/notificacoes.controller';
import { NotificacoesGateway } from './gateways/notificacoes.gateway';
import { Notificacao } from './entities/notificacao.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacao]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'fiscal_super_secret_key_2025'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [NotificacoesService, NotificacoesGateway],
  controllers: [NotificacoesController],
  exports: [NotificacoesService, NotificacoesGateway],
})
export class NotificacoesModule {}
