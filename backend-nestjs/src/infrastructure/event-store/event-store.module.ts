import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventStoreEntity } from './entities/event.entity';
import { EventStoreRepository } from './repositories/event-store.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EventStoreEntity])],
  providers: [EventStoreRepository],
  exports: [EventStoreRepository],
})
export class EventStoreModule {}
