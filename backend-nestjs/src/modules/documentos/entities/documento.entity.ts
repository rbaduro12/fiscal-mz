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

  @Column({ type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ type: 'uuid',  nullable: true })
  entidadeId: string;

  @ManyToOne(() => Entidade)
  @JoinColumn({ name: 'entidade_id' })
  entidade: Entidade;

  @Column({ type: 'uuid',  nullable: true })
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

  @Column({ length: 30, nullable: true })
  numeroCompleto: string;

  @Column({
    type: 'enum',
    enum: EstadoDocumento,
    default: EstadoDocumento.RASCUNHO,
  })
  estado: EstadoDocumento;

  @Column({ type: 'uuid',  nullable: true })
  documentoOrigemId: string;

  @ManyToOne(() => Documento)
  @JoinColumn({ name: 'documento_origem_id' })
  documentoOrigem: Documento;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  dataEmissao: Date;

  @Column({ type: 'date', nullable: true })
  dataVencimento: Date;

  @Column({ nullable: true })
  dataPagamento: Date;

  @Column({ type: 'date', nullable: true })
  dataValidade: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDescontos: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalIva: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPagar: number;

  // Snapshot do cliente
  @Column({ length: 255, nullable: true })
  entidadeNome: string;

  @Column({ length: 9, nullable: true })
  entidadeNuit: string;

  @Column({ type: 'text', nullable: true })
  entidadeEndereco: string;

  @Column({
    type: 'enum',
    enum: TipoOperacaoIVA,
    default: TipoOperacaoIVA.TRIBUTAVEL_16,
  })
  operacaoIva: TipoOperacaoIVA;

  @Column({ length: 255, nullable: true })
  motivoIsencao: string;

  @Column({ length: 2, nullable: true })
  paisOrigem: string;

  // Segurança fiscal
  @Column({ length: 64, nullable: true })
  hashFiscal: string;

  @Column({ type: 'text', nullable: true })
  qrCodeData: string;

  @Column({ length: 100, nullable: true })
  codigoValidacao: string;

  @Column({ default: () => 'NOW()' })
  dataRegistoSistema: Date;

  // Soft delete fiscal
  @Column({ default: false })
  anulado: boolean;

  @Column({ type: 'text', nullable: true })
  motivoAnulacao: string;

  @Column({ nullable: true })
  dataAnulacao: Date;

  @Column({ type: 'uuid',  nullable: true })
  anuladoPor: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LinhaDocumento, linha => linha.documento, { cascade: true })
  linhas: LinhaDocumento[];
}
