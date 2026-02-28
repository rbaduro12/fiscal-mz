import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventStoreEntity } from '../entities/event.entity';

export interface DomainEvent {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: Record<string, any>;
  tenantId: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class EventStoreRepository {
  constructor(
    @InjectRepository(EventStoreEntity)
    private readonly repository: Repository<EventStoreEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Persiste um evento no event store com versionamento otimista
   */
  async appendEvent(event: DomainEvent, expectedVersion: number): Promise<EventStoreEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Verificar se já existe evento com esta versão (concorrência)
      const existingEvent = await manager.findOne(EventStoreEntity, {
        where: {
          aggregateId: event.aggregateId,
          aggregateVersion: expectedVersion,
        },
      });

      if (existingEvent) {
        throw new Error(
          `Concurrency conflict: Aggregate ${event.aggregateId} already has version ${expectedVersion}`
        );
      }

      const eventEntity = manager.create(EventStoreEntity, {
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        aggregateVersion: expectedVersion,
        eventType: event.eventType,
        payload: event.payload,
        metadata: event.metadata,
        tenantId: event.tenantId,
        published: false,
      });

      return manager.save(eventEntity);
    });
  }

  /**
   * Recupera todos os eventos de um aggregate para replay
   */
  async getEventsForAggregate(
    aggregateId: string,
    fromVersion?: number,
  ): Promise<EventStoreEntity[]> {
    const query = this.repository
      .createQueryBuilder('event')
      .where('event.aggregateId = :aggregateId', { aggregateId })
      .orderBy('event.aggregateVersion', 'ASC');

    if (fromVersion) {
      query.andWhere('event.aggregateVersion >= :fromVersion', { fromVersion });
    }

    return query.getMany();
  }

  /**
   * Recupera eventos não publicados para processamento
   */
  async getUnpublishedEvents(limit: number = 100): Promise<EventStoreEntity[]> {
    return this.repository.find({
      where: { published: false },
      order: { occurredOn: 'ASC' },
      take: limit,
    });
  }

  /**
   * Marca eventos como publicados
   */
  async markAsPublished(eventIds: string[]): Promise<void> {
    await this.repository.update(
      { id: eventIds as any },
      { published: true }
    );
  }

  /**
   * Obtém a última versão de um aggregate
   */
  async getLastVersion(aggregateId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('event')
      .select('MAX(event.aggregateVersion)', 'maxVersion')
      .where('event.aggregateId = :aggregateId', { aggregateId })
      .getRawOne();

    return result?.maxVersion || 0;
  }

  /**
   * Query para auditoria - busca eventos por tipo e período
   */
  async getEventsByTypeAndPeriod(
    eventType: string,
    tenantId: string,
    from: Date,
    to: Date,
  ): Promise<EventStoreEntity[]> {
    return this.repository.find({
      where: {
        eventType,
        tenantId,
        occurredOn: {
          $gte: from,
          $lte: to,
        } as any,
      },
      order: { occurredOn: 'DESC' },
    });
  }
}
