import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum EventType {
  QUOTE_CREATED = 'QUOTE_CREATED',
  QUOTE_UPDATED = 'QUOTE_UPDATED',
  QUOTE_ACCEPTED = 'QUOTE_ACCEPTED',
  QUOTE_REJECTED = 'QUOTE_REJECTED',
  QUOTE_NEGOTIATED = 'QUOTE_NEGOTIATED',
  QUOTE_EXPIRED = 'QUOTE_EXPIRED',
  QUOTE_CONVERTED = 'QUOTE_CONVERTED',
  PROFORMA_GENERATED = 'PROFORMA_GENERATED',
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  INVOICE_GENERATED = 'INVOICE_GENERATED',
}

@Entity('event_store')
@Index(['aggregateId', 'aggregateType'])
@Index(['eventType', 'createdAt'])
export class EventStore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'aggregate_id' })
  aggregateId: string;

  @Column({ length: 50, name: 'aggregate_type' })
  aggregateType: string;

  @Column({
    type: 'enum',
    enum: EventType,
    name: 'event_type',
  })
  eventType: EventType;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @Column({ type: 'int', name: 'version', default: 1 })
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
