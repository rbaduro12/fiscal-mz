import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Entidade } from '../../entidades/entities/entidade.entity';
import { TipoOperacaoIVA } from '../../documentos/entities/documento.entity';

export enum TipoArtigo {
  PRODUTO = 'PRODUTO',
  SERVICO = 'SERVICO',
}

@Entity('artigos')
export class Artigo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ length: 50 })
  codigo: string;

  @Column({ length: 255 })
  descricao: string;

  @Column({
    type: 'enum',
    enum: TipoArtigo,
    default: TipoArtigo.SERVICO,
  })
  tipo: TipoArtigo;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precoVenda: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precoCusto: number;

  // Stock
  @Column({ default: 0 })
  stockAtual: number;

  @Column({ default: 0 })
  stockMinimo: number;

  @Column({ default: 0 })
  stockMaximo: number;

  @Column({ length: 50, nullable: true })
  localizacao: string;

  @Column({ length: 10, default: 'UN' })
  unidade: string;

  @Column({
    type: 'enum',
    enum: TipoOperacaoIVA,
    default: TipoOperacaoIVA.TRIBUTAVEL_16,
  })
  categoriaIva: TipoOperacaoIVA;

  @Column({ length: 20, nullable: true })
  contaContabil: string;

  @Column({ type: 'uuid',  nullable: true })
  fornecedorId: string;

  @ManyToOne(() => Entidade)
  @JoinColumn({ name: 'fornecedor_id' })
  fornecedor: Entidade;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
