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

  @Column({ type: 'uuid', name: 'empresa_id' })
  empresaId: string;

  @Column({ name: 'periodo_ano' })
  periodoAno: number;

  @Column({ name: 'periodo_mes' })
  periodoMes: number;

  // Quadro 01 - Taxa Normal 16%
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q1_vendas_bens16' })
  q1VendasBens16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q1_vendas_bens_iva' })
  q1VendasBensIva: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q1_vendas_servicos16' })
  q1VendasServicos16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q1_vendas_servicos_iva' })
  q1VendasServicosIva: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q1_total_base16' })
  q1TotalBase16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q1_total_iva16' })
  q1TotalIva16: number;

  // Quadro 02 - Taxa Intermédia 10%
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q2_bens10' })
  q2Bens10: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q2_bens_iva10' })
  q2BensIva10: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q2_servicos10' })
  q2Servicos10: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q2_servicos_iva10' })
  q2ServicosIva10: number;

  // Quadro 03 - Taxa Reduzida 5%
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q3_bens5' })
  q3Bens5: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q3_bens_iva5' })
  q3BensIva5: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q3_servicos5' })
  q3Servicos5: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q3_servicos_iva5' })
  q3ServicosIva5: number;

  // Quadro 04 - Isentas e Não Sujeitas
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q4_exportacoes' })
  q4Exportacoes: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q4_isentos_artigo15' })
  q4IsentosArtigo15: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q4_nao_sujeitos' })
  q4NaoSujeitos: number;

  // Quadro 05 - Compras (IVA Dedutível)
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q5_compras_bens16' })
  q5ComprasBens16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q5_compras_bens_iva16' })
  q5ComprasBensIva16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q5_compras_servicos16' })
  q5ComprasServicos16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q5_compras_servicos_iva16' })
  q5ComprasServicosIva16: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q5_importacoes_bens' })
  q5ImportacoesBens: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q5_importacoes_iva' })
  q5ImportacoesIva: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q5_compras5' })
  q5Compras5: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q5_compras_iva5' })
  q5ComprasIva5: number;

  // Quadro 06 - Apuramento
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q6_iva_liquidado' })
  q6IvaLiquidado: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q6_iva_dedutivel' })
  q6IvaDedutivel: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q6_diferenca' })
  q6Diferenca: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q6_credito_periodo_anterior' })
  q6CreditoPeriodoAnterior: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q6_iva_a_pagar' })
  q6IvaAPagar: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'q6_credito_transportar' })
  q6CreditoTransportar: number;

  // Controlo
  @Column({
    type: 'enum',
    enum: EstadoDeclaracao,
    default: EstadoDeclaracao.RASCUNHO,
  })
  estado: EstadoDeclaracao;

  @Column({ type: 'text', nullable: true, name: 'xml_gerado' })
  xmlGerado: string;

  @Column({ nullable: true, name: 'data_submissao' })
  dataSubmissao: Date;

  @Column({ nullable: true, name: 'numero_confirmacao_at' })
  numeroConfirmacaoAT: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
