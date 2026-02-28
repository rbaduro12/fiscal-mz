import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Documento } from './documento.entity';
import { Artigo } from '../../artigos/entities/artigo.entity';

@Entity('linhas_documento')
export class LinhaDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'documento_id' })
  documentoId: string;

  @ManyToOne(() => Documento, documento => documento.linhas)
  @JoinColumn({ name: 'documento_id' })
  documento: Documento;

  @Column({ type: 'uuid',  nullable: true, name: 'artigo_id' })
  artigoId: string;

  @ManyToOne(() => Artigo)
  @JoinColumn({ name: 'artigo_id' })
  artigo: Artigo;

  @Column({ length: 50, nullable: true, name: 'codigo_artigo' })
  codigoArtigo: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ length: 10, nullable: true })
  unidade: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantidade: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'preco_unitario' })
  precoUnitario: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 16, name: 'taxa_iva' })
  taxaIva: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'valor_iva' })
  valorIva: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'desconto_percentual' })
  descontoPercentual: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'desconto_valor' })
  descontoValor: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_linha' })
  totalLinha: number;

  @Column({ nullable: true })
  ordem: number;

  @Column({ default: false, name: 'movimentou_stock' })
  movimentouStock: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, name: 'quantidade_stock_movimentada' })
  quantidadeStockMovimentada: number;
}
