import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { databaseConfig } from './infrastructure/database/database.config';
import { EventStoreModule } from './infrastructure/event-store/event-store.module';

// Modules
import { WorkflowModule } from './modules/workflow/workflow.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { FiscalModule } from './modules/fiscal/fiscal.module';
import { SyncModule } from './modules/sync/sync.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // Core
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 10,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    
    // Database
    TypeOrmModule.forRootAsync(databaseConfig),
    
    // CQRS & Events
    CqrsModule.forRoot(),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    
    // Infrastructure
    EventStoreModule,
    
    // Domain Modules
    WorkflowModule,
    PaymentsModule,
    FiscalModule,
    SyncModule,
    NotificationsModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
