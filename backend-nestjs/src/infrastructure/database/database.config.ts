import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { EventStoreEntity } from '../event-store/entities/event.entity';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'fiscal'),
    password: configService.get('DB_PASSWORD', 'password'),
    database: configService.get('DB_NAME', 'fiscal_mz'),
    schema: configService.get('DB_SCHEMA', 'public'),
    entities: [
      EventStoreEntity,
      __dirname + '/../../modules/**/*.entity{.ts,.js}',
    ],
    synchronize: configService.get('NODE_ENV') !== 'production',
    logging: configService.get('DB_LOGGING', 'false') === 'true',
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    migrationsRun: true,
  }),
};
