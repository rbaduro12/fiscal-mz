import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Utilizador } from '../../utilizadores/entities/utilizador.entity';

export enum RegimeIVA {
  NORMAL = 'NORMAL',
  SIMPLIFICADO = 'SIMPLIFICADO',
  EXCLUSIVO = 'EXCLUSIVO',
}

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 9, unique: true })
  nuit: string;

  @Column({ length: 255 })
  nomeFiscal: string;

  @Column({ length: 255, nullable: true })
  nomeComercial: string;

  @Column({
    type: 'enum',
    enum: RegimeIVA,
    default: RegimeIVA.NORMAL,
  })
  regime: RegimeIVA;

  @Column({ type: 'text', nullable: true })
  endereco: string;

  @Column({ length: 100, nullable: true })
  cidade: string;

  @Column({ length: 50, nullable: true })
  provincia: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  // Séries documentais
  @Column({ length: 5, default: 'CQ' })
  serieCotacao: string;

  @Column({ length: 5, default: 'PF' })
  serieProforma: string;

  @Column({ length: 5, default: 'FT' })
  serieFactura: string;

  @Column({ length: 5, default: 'RC' })
  serieRecibo: string;

  @Column({ length: 5, default: 'GT' })
  serieGuia: string;

  // Contadores
  @Column({ default: 0 })
  ultimoNumeroCotacao: number;

  @Column({ default: 0 })
  ultimoNumeroProforma: number;

  @Column({ default: 0 })
  ultimoNumeroFactura: number;

  @Column({ default: 0 })
  ultimoNumeroRecibo: number;

  @Column({ default: 0 })
  ultimoNumeroGuia: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  creditoIvaPeriodoAnterior: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  limiteCreditoPadrao: number;

  @Column({ default: 30 })
  prazoPagamentoDias: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Utilizador, utilizador => utilizador.empresa)
  utilizadores: Utilizador[];
}
