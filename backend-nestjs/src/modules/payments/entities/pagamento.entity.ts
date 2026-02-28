import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Documento } from '../../documentos/entities/documento.entity';
import { Entidade } from '../../entidades/entities/entidade.entity';
import { Utilizador } from '../../utilizadores/entities/utilizador.entity';

export enum MetodoPagamento {
  CASH = 'CASH',
  MPESA = 'MPESA',
  EMOLA = 'EMOLA',
  BIM = 'BIM',
  CARTAO = 'CARTAO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  CHEQUE = 'CHEQUE',
}

export enum EstadoPagamento {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  REJEITADO = 'REJEITADO',
}

@Entity('pagamentos')
export class Pagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid',  nullable: true })
  documentoId: string;

  @ManyToOne(() => Documento)
  @JoinColumn({ name: 'documento_id' })
  documento: Documento;

  @Column({ type: 'uuid',  nullable: true })
  entidadeId: string;

  @ManyToOne(() => Entidade)
  @JoinColumn({ name: 'entidade_id' })
  entidade: Entidade;

  @Column({
    type: 'enum',
    enum: MetodoPagamento,
  })
  metodo: MetodoPagamento;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valor: number;

  @CreateDateColumn()
  dataPagamento: Date;

  @Column({ type: 'date', nullable: true })
  dataCompensacao: Date;

  @Column({ length: 255, nullable: true })
  referenciaExterna: string;

  @Column({ type: 'text', nullable: true })
  comprovativoUrl: string;

  @Column({
    type: 'enum',
    enum: EstadoPagamento,
    default: EstadoPagamento.PENDENTE,
  })
  estado: EstadoPagamento;

  @Column({ type: 'uuid',  nullable: true })
  createdBy: string;

  @ManyToOne(() => Utilizador)
  @JoinColumn({ name: 'created_by' })
  criadoPor: Utilizador;

  @CreateDateColumn()
  createdAt: Date;
}
