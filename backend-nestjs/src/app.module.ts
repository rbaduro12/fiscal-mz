import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

// Entidades
import { Empresa } from './modules/empresas/entities/empresa.entity';
import { Utilizador } from './modules/utilizadores/entities/utilizador.entity';
import { Entidade } from './modules/entidades/entities/entidade.entity';
import { Artigo } from './modules/artigos/entities/artigo.entity';
import { Documento } from './modules/documentos/entities/documento.entity';
import { LinhaDocumento } from './modules/documentos/entities/linha-documento.entity';
import { MovimentoStock } from './modules/stock/entities/movimento-stock.entity';
import { Pagamento } from './modules/payments/entities/pagamento.entity';
import { Notificacao } from './modules/notificacoes/entities/notificacao.entity';
import { DeclaracaoIVA } from './modules/fiscal/entities/declaracao-iva.entity';

// Módulos
import { AuthModule } from './modules/auth/auth.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { UtilizadoresModule } from './modules/utilizadores/utilizadores.module';
import { EntidadesModule } from './modules/entidades/entidades.module';
import { ArtigosModule } from './modules/artigos/artigos.module';
import { DocumentosModule } from './modules/documentos/documentos.module';
import { StockModule } from './modules/stock/stock.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificacoesModule } from './modules/notificacoes/notificacoes.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { SeedModule } from './modules/seed/seed.module';
import { FiscalModule } from './modules/fiscal/fiscal.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    // Configuração global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM + PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'fiscal_admin'),
        password: config.get('DB_PASSWORD', 'fiscal_secure_2025'),
        database: config.get('DB_NAME', 'fiscal_mz_db'),
        
        // Entidades
        entities: [
          Empresa,
          Utilizador,
          Entidade,
          Artigo,
          Documento,
          LinhaDocumento,
          MovimentoStock,
          Pagamento,
          Notificacao,
          DeclaracaoIVA,
        ],
        
        // Sincronização (DESATIVAR EM PRODUÇÃO - usar migrations)
        synchronize: false,
        
        // Logging
        logging: config.get('NODE_ENV') === 'development',
        
        // Pool de conexões
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
    }),

    // Módulos da aplicação
    AuthModule,
    EmpresasModule,
    UtilizadoresModule,
    EntidadesModule,
    ArtigosModule,
    DocumentosModule,
    StockModule,
    PaymentsModule,
    NotificacoesModule,
    WorkflowModule,
    SeedModule,
    FiscalModule,
    EmailModule,
  ],
})
export class AppModule {}
