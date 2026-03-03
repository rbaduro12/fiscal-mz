import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ItemCotacao } from './item-cotacao.entity';

export enum CotacaoStatus {
  RASCUNHO = 'RASCUNHO',
  ENVIADA = 'ENVIADA',
  NEGOCIANDO = 'NEGOCIANDO',
  ACEITE = 'ACEITE',
  REJEITADA = 'REJEITADA',
  CONVERTIDA = 'CONVERTIDA',
  EXPIRADA = 'EXPIRADA',
}

export enum TipoPagamento {
  MPESA = 'MPESA',
  CASH = 'CASH',
  CARTAO = 'CARTAO',
  ESCROW = 'ESCROW',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

@Entity('cotacoes')
export class Cotacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'uuid', name: 'vendedor_id' })
  vendedorId: string;

  @Column({ type: 'uuid', name: 'cliente_id' })
  clienteId: string;

  @Column({ length: 30, unique: true })
  numero: string;

  @Column({
    type: 'enum',
    enum: CotacaoStatus,
    default: CotacaoStatus.RASCUNHO,
  })
  status: CotacaoStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'total_iva' })
  totalIva: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'int', default: 30, name: 'validade_dias' })
  validadeDias: number;

  @Column({ type: 'timestamp', nullable: true, name: 'data_expiracao' })
  dataExpiracao: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'data_aceite' })
  dataAceite: Date;

  @Column({ type: 'uuid', nullable: true, name: 'proforma_id' })
  proformaId: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ItemCotacao, (item) => item.cotacao, { cascade: true })
  itens: ItemCotacao[];
}
