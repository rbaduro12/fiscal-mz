import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Documento } from '../../documentos/entities/documento.entity';

export enum TipoNotificacao {
  COTACAO_RECEBIDA = 'COTACAO_RECEBIDA',
  COTACAO_ACEITE = 'COTACAO_ACEITE',
  COTACAO_REJEITADA = 'COTACAO_REJEITADA',
  PROFORMA_EMITIDA = 'PROFORMA_EMITIDA',
  PAGAMENTO_CONFIRMADO = 'PAGAMENTO_CONFIRMADO',
  FACTURA_EMITIDA = 'FACTURA_EMITIDA',
  STOCK_BAIXO = 'STOCK_BAIXO',
  DOCUMENTO_VENCIDO = 'DOCUMENTO_VENCIDO',
}

@Entity('notificacoes')
export class Notificacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid',  nullable: true })
  empresaRemetenteId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_remetente_id' })
  empresaRemetente: Empresa;

  @Column({ type: 'uuid' })
  empresaDestinatarioId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_destinatario_id' })
  empresaDestinatario: Empresa;

  @Column({
    type: 'enum',
    enum: TipoNotificacao,
  })
  tipo: TipoNotificacao;

  @Column({ type: 'uuid',  nullable: true })
  documentoId: string;

  @ManyToOne(() => Documento)
  @JoinColumn({ name: 'documento_id' })
  documento: Documento;

  @Column({ length: 255 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  mensagem: string;

  @Column({ default: false })
  lida: boolean;

  @Column({ nullable: true })
  dataLeitura: Date;

  @Column({ length: 255, nullable: true })
  acaoUrl: string;

  @Column({ length: 50, nullable: true })
  acaoTexto: string;

  @CreateDateColumn()
  createdAt: Date;
}
