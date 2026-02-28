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

  @Column({ type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ type: 'uuid' })
  artigoId: string;

  @ManyToOne(() => Artigo)
  @JoinColumn({ name: 'artigo_id' })
  artigo: Artigo;

  @Column({ type: 'uuid', nullable: true })
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

  @Column()
  stockAnterior: number;

  @Column()
  stockPosterior: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  custoUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  custoMedio: number;

  @Column({ length: 20, nullable: true })
  documentoTipo: string;

  @Column({ length: 30, nullable: true })
  documentoNumero: string;

  @Column({ type: 'text', nullable: true })
  observacao: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => Utilizador)
  @JoinColumn({ name: 'created_by' })
  utilizador: Utilizador;
}
