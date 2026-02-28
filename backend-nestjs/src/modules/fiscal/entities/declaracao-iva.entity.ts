import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EstadoDeclaracao {
  RASCUNHO = 'RASCUNHO',
  VALIDADA = 'VALIDADA',
  SUBMETIDA = 'SUBMETIDA',
  ACEITE = 'ACEITE',
}

@Entity('declaracoes_iva')
export class DeclaracaoIVA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  empresaId: string;

  @Column()
  periodoAno: number;

  @Column()
  periodoMes: number;

  // Quadro 01 - Taxa Normal 16%
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q1VendasBens16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q1VendasBensIva: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q1VendasServicos16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q1VendasServicosIva: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q1TotalBase16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q1TotalIva16: number;

  // Quadro 02 - Taxa Intermédia 10%
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q2Bens10: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q2BensIva10: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q2Servicos10: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q2ServicosIva10: number;

  // Quadro 03 - Taxa Reduzida 5%
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q3Bens5: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q3BensIva5: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q3Servicos5: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q3ServicosIva5: number;

  // Quadro 04 - Isentas e Não Sujeitas
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q4Exportacoes: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q4IsentosArtigo15: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q4NaoSujeitos: number;

  // Quadro 05 - Compras (IVA Dedutível)
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q5ComprasBens16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q5ComprasBensIva16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q5ComprasServicos16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q5ComprasServicosIva16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q5ImportacoesBens: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q5ImportacoesIva: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q5Compras5: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q5ComprasIva5: number;

  // Quadro 06 - Apuramento
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q6IvaLiquidado: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q6IvaDedutivel: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q6Diferenca: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q6CreditoPeriodoAnterior: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q6IvaAPagar: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  q6CreditoTransportar: number;

  // Controlo
  @Column({
    type: 'enum',
    enum: EstadoDeclaracao,
    default: EstadoDeclaracao.RASCUNHO,
  })
  estado: EstadoDeclaracao;

  @Column({ type: 'text', nullable: true })
  xmlGerado: string;

  @Column({ nullable: true })
  dataSubmissao: Date;

  @Column({ nullable: true })
  numeroConfirmacaoAT: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
