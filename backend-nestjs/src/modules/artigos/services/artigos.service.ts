import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artigo } from '../entities/artigo.entity';

@Injectable()
export class ArtigosService {
  constructor(
    @InjectRepository(Artigo)
    private repo: Repository<Artigo>,
  ) {}

  async findByEmpresa(empresaId: string): Promise<Artigo[]> {
    return this.repo.find({ where: { empresaId, ativo: true } });
  }

  async findOne(id: string): Promise<Artigo> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<Artigo>): Promise<Artigo> {
    const artigo = this.repo.create(data);
    return this.repo.save(artigo);
  }
}
