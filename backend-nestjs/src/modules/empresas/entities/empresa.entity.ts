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

  @Column({ length: 255, name: 'nome_fiscal' })
  nomeFiscal: string;

  @Column({ length: 255, nullable: true, name: 'nome_comercial' })
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
  @Column({ length: 5, default: 'CQ', name: 'serie_cotacao' })
  serieCotacao: string;

  @Column({ length: 5, default: 'PF', name: 'serie_proforma' })
  serieProforma: string;

  @Column({ length: 5, default: 'FT', name: 'serie_factura' })
  serieFactura: string;

  @Column({ length: 5, default: 'RC', name: 'serie_recibo' })
  serieRecibo: string;

  @Column({ length: 5, default: 'GT', name: 'serie_guia' })
  serieGuia: string;

  // Contadores
  @Column({ default: 0, name: 'ultimo_numero_cotacao' })
  ultimoNumeroCotacao: number;

  @Column({ default: 0, name: 'ultimo_numero_proforma' })
  ultimoNumeroProforma: number;

  @Column({ default: 0, name: 'ultimo_numero_factura' })
  ultimoNumeroFactura: number;

  @Column({ default: 0, name: 'ultimo_numero_recibo' })
  ultimoNumeroRecibo: number;

  @Column({ default: 0, name: 'ultimo_numero_guia' })
  ultimoNumeroGuia: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'credito_iva_periodo_anterior' })
  creditoIvaPeriodoAnterior: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'limite_credito_padrao' })
  limiteCreditoPadrao: number;

  @Column({ default: 30, name: 'prazo_pagamento_dias' })
  prazoPagamentoDias: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Utilizador, utilizador => utilizador.empresa)
  utilizadores: Utilizador[];
}
