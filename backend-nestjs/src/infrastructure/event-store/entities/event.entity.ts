import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

/**
 * Event Store - Tabela append-only para Event Sourcing
 * Todos os eventos de domínio são persistidos aqui para auditoria e replay
 */
@Entity('event_store')
@Index(['aggregateId', 'aggregateVersion'])
@Index(['eventType', 'occurredOn'])
@Index(['tenantId', 'occurredOn'])
export class EventStoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  aggregateId: string;

  @Column()
  aggregateType: string; // 'Quote', 'Invoice', 'Payment'

  @Column('int')
  aggregateVersion: number; // Versão sequencial do aggregate

  @Column()
  eventType: string; // Nome do evento: QuoteCreatedEvent, PaymentConfirmedEvent

  @Column('jsonb')
  payload: Record<string, any>; // Dados do evento

  @Column('jsonb', { nullable: true })
  metadata: {
    tenantId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    causationId?: string; // ID do comando que causou o evento
    correlationId?: string; // ID para tracing
  };

  @Column('uuid')
  tenantId: string;

  @CreateDateColumn()
  occurredOn: Date;

  @Column({ default: false })
  published: boolean; // Se o evento já foi publicado nos handlers
}
