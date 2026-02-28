import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';

export enum TipoEntidade {
  CLIENTE = 'CLIENTE',
  FORNECEDOR = 'FORNECEDOR',
  AMBOS = 'AMBOS',
}

@Entity('entidades')
export class Entidade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ length: 9, nullable: true })
  nuit: string;

  @Column({ length: 255 })
  nome: string;

  @Column({
    type: 'enum',
    enum: TipoEntidade,
    default: TipoEntidade.CLIENTE,
  })
  tipo: TipoEntidade;

  @Column({ type: 'text', nullable: true })
  endereco: string;

  @Column({ length: 100, nullable: true })
  cidade: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  limiteCredito: number;

  @Column({ default: 30 })
  prazoPagamentoDias: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  saldoEmDivida: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  descontoPadrao: number;

  @CreateDateColumn()
  createdAt: Date;
}
