import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresas/entities/empresa.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  GESTOR = 'GESTOR',
  VENDEDOR = 'VENDEDOR',
  CONTABILISTA = 'CONTABILISTA',
  CLIENTE = 'CLIENTE',
}

@Entity('utilizadores')
export class Utilizador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, empresa => empresa.utilizadores)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ length: 255 })
  nome: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VENDEDOR,
  })
  role: UserRole;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ nullable: true })
  ultimoAcesso: Date;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
