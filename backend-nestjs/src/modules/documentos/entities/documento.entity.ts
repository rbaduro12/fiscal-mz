import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Entidade } from '../../entidades/entities/entidade.entity';
import { Utilizador } from '../../utilizadores/entities/utilizador.entity';
import { LinhaDocumento } from './linha-documento.entity';

export enum TipoDocumento {
  COTACAO = 'COTACAO',
  PROFORMA = 'PROFORMA',
  FACTURA = 'FACTURA',
  FACTURA_RECIBO = 'FACTURA_RECIBO',
  NOTA_CREDITO = 'NOTA_CREDITO',
  NOTA_DEBITO = 'NOTA_DEBITO',
  RECIBO = 'RECIBO',
  GUIA = 'GUIA',
}

export enum EstadoDocumento {
  RASCUNHO = 'RASCUNHO',
  PENDENTE = 'PENDENTE',
  EMITIDA = 'EMITIDA',
  ACEITE = 'ACEITE',
  REJEITADA = 'REJEITADA',
  PAGA = 'PAGA',
  ANULADA = 'ANULADA',
  VENCIDA = 'VENCIDA',
}

export enum TipoOperacaoIVA {
  TRIBUTAVEL_16 = 'TRIBUTAVEL_16',
  TRIBUTAVEL_10 = 'TRIBUTAVEL_10',
  TRIBUTAVEL_5 = 'TRIBUTAVEL_5',
  ISENTO = 'ISENTO',
  NAO_SUJEITO = 'NAO_SUJEITO',
  EXPORTACAO = 'EXPORTACAO',
}

@Entity('documentos')
export class Documento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'empresa_id' })
  empresaId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ type: 'uuid',  nullable: true, name: 'entidade_id' })
  entidadeId: string;

  @ManyToOne(() => Entidade)
  @JoinColumn({ name: 'entidade_id' })
  entidade: Entidade;

  @Column({ type: 'uuid',  nullable: true, name: 'utilizador_id' })
  utilizadorId: string;

  @ManyToOne(() => Utilizador)
  @JoinColumn({ name: 'utilizador_id' })
  utilizador: Utilizador;

  @Column({
    type: 'enum',
    enum: TipoDocumento,
  })
  tipo: TipoDocumento;

  @Column({ length: 5, default: 'TEMP' })
  serie: string;

  @Column({ nullable: true })
  numero: number;

  @Column({ length: 30, nullable: true, name: 'numero_completo' })
  numeroCompleto: string;

  @Column({
    type: 'enum',
    enum: EstadoDocumento,
    default: EstadoDocumento.RASCUNHO,
  })
  estado: EstadoDocumento;

  @Column({ type: 'uuid',  nullable: true, name: 'documento_origem_id' })
  documentoOrigemId: string;

  @ManyToOne(() => Documento)
  @JoinColumn({ name: 'documento_origem_id' })
  documentoOrigem: Documento;

  @Column({ type: 'date', default: () => 'CURRENT_DATE', name: 'data_emissao' })
  dataEmissao: Date;

  @Column({ type: 'date', nullable: true, name: 'data_vencimento' })
  dataVencimento: Date;

  @Column({ nullable: true, name: 'data_pagamento' })
  dataPagamento: Date;

  @Column({ type: 'date', nullable: true, name: 'data_validade' })
  dataValidade: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'total_descontos' })
  totalDescontos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'total_iva' })
  totalIva: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'total_pagar' })
  totalPagar: number;

  // Snapshot do cliente
  @Column({ length: 255, nullable: true, name: 'entidade_nome' })
  entidadeNome: string;

  @Column({ length: 9, nullable: true, name: 'entidade_nuit' })
  entidadeNuit: string;

  @Column({ type: 'text', nullable: true, name: 'entidade_endereco' })
  entidadeEndereco: string;

  @Column({
    type: 'enum',
    enum: TipoOperacaoIVA,
    default: TipoOperacaoIVA.TRIBUTAVEL_16,
    name: 'operacao_iva',
  })
  operacaoIva: TipoOperacaoIVA;

  @Column({ length: 255, nullable: true, name: 'motivo_isencao' })
  motivoIsencao: string;

  @Column({ length: 2, nullable: true, name: 'pais_origem' })
  paisOrigem: string;

  // Segurança fiscal
  @Column({ length: 64, nullable: true, name: 'hash_fiscal' })
  hashFiscal: string;

  @Column({ type: 'text', nullable: true, name: 'qr_code_data' })
  qrCodeData: string;

  @Column({ length: 100, nullable: true, name: 'codigo_validacao' })
  codigoValidacao: string;

  @Column({ default: () => 'NOW()', name: 'data_registo_sistema' })
  dataRegistoSistema: Date;

  // Soft delete fiscal
  @Column({ default: false })
  anulado: boolean;

  @Column({ type: 'text', nullable: true, name: 'motivo_anulacao' })
  motivoAnulacao: string;

  @Column({ nullable: true, name: 'data_anulacao' })
  dataAnulacao: Date;

  @Column({ type: 'uuid',  nullable: true, name: 'anulado_por' })
  anuladoPor: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => LinhaDocumento, linha => linha.documento, { cascade: true })
  linhas: LinhaDocumento[];
}
