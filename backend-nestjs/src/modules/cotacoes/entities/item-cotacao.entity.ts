import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cotacao } from './cotacao.entity';

@Entity('itens_cotacao')
export class ItemCotacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'cotacao_id' })
  cotacaoId: string;

  @ManyToOne(() => Cotacao, (cotacao) => cotacao.itens)
  @JoinColumn({ name: 'cotacao_id' })
  cotacao: Cotacao;

  @Column({ type: 'uuid', name: 'artigo_id' })
  artigoId: string;

  @Column({ length: 50 })
  codigo: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantidade: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'preco_unitario' })
  precoUnitario: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  desconto: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 16, name: 'taxa_iva' })
  taxaIva: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_linha' })
  totalLinha: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'iva_linha' })
  ivaLinha: number;

  @Column({ type: 'boolean', default: false })
  negociado: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'preco_original' })
  precoOriginal: number;
}
