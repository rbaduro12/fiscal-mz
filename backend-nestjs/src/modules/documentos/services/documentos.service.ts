import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from '../entities/documento.entity';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private repo: Repository<Documento>,
  ) {}

  async findByEmpresa(empresaId: string): Promise<Documento[]> {
    return this.repo.find({ 
      where: { empresaId },
      relations: ['linhas', 'entidade'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Documento> {
    return this.repo.findOne({ 
      where: { id },
      relations: ['linhas', 'entidade', 'empresa']
    });
  }

  async findByEntidade(entidadeId: string): Promise<Documento[]> {
    return this.repo.find({
      where: { entidadeId },
      relations: ['linhas', 'empresa'],
      order: { createdAt: 'DESC' }
    });
  }
}
