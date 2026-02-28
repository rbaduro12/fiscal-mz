import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Artigo } from '../../artigos/entities/artigo.entity';
import { Documento } from '../../documentos/entities/documento.entity';
import { Utilizador } from '../../utilizadores/entities/utilizador.entity';

export enum TipoMovimentoStock {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  AJUSTE = 'AJUSTE',
  DEVOLUCAO = 'DEVOLUCAO',
  INVENTARIO = 'INVENTARIO',
}

@Entity('movimentos_stock')
export class MovimentoStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'empresa_id' })
  empresaId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ type: 'uuid', name: 'artigo_id' })
  artigoId: string;

  @ManyToOne(() => Artigo)
  @JoinColumn({ name: 'artigo_id' })
  artigo: Artigo;

  @Column({ type: 'uuid', nullable: true, name: 'documento_id' })
  documentoId: string;

  @ManyToOne(() => Documento)
  @JoinColumn({ name: 'documento_id' })
  documento: Documento;

  @Column({
    type: 'enum',
    enum: TipoMovimentoStock,
  })
  tipo: TipoMovimentoStock;

  @Column()
  quantidade: number;

  @Column({ name: 'stock_anterior' })
  stockAnterior: number;

  @Column({ name: 'stock_posterior' })
  stockPosterior: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'custo_unitario' })
  custoUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'custo_medio' })
  custoMedio: number;

  @Column({ length: 20, nullable: true, name: 'documento_tipo' })
  documentoTipo: string;

  @Column({ length: 30, nullable: true, name: 'documento_numero' })
  documentoNumero: string;

  @Column({ type: 'text', nullable: true })
  observacao: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => Utilizador)
  @JoinColumn({ name: 'created_by' })
  utilizador: Utilizador;
}
