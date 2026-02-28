import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Documento } from './documento.entity';
import { Artigo } from '../../artigos/entities/artigo.entity';

@Entity('linhas_documento')
export class LinhaDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  documentoId: string;

  @ManyToOne(() => Documento, documento => documento.linhas)
  @JoinColumn({ name: 'documento_id' })
  documento: Documento;

  @Column({ type: 'uuid',  nullable: true })
  artigoId: string;

  @ManyToOne(() => Artigo)
  @JoinColumn({ name: 'artigo_id' })
  artigo: Artigo;

  @Column({ length: 50, nullable: true })
  codigoArtigo: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ length: 10, nullable: true })
  unidade: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantidade: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precoUnitario: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 16 })
  taxaIva: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorIva: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  descontoPercentual: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descontoValor: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalLinha: number;

  @Column({ nullable: true })
  ordem: number;

  @Column({ default: false })
  movimentouStock: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  quantidadeStockMovimentada: number;
}
