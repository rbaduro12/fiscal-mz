import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entidade } from '../entities/entidade.entity';

@Injectable()
export class EntidadesService {
  constructor(
    @InjectRepository(Entidade)
    private repo: Repository<Entidade>,
  ) {}

  async findByEmpresa(empresaId: string): Promise<Entidade[]> {
    return this.repo.find({ where: { empresaId } });
  }

  async create(data: Partial<Entidade>): Promise<Entidade> {
    const entidade = this.repo.create(data);
    return this.repo.save(entidade);
  }
}
