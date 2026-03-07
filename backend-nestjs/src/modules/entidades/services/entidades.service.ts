import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Entidade } from '../entities/entidade.entity';
import { NuitValidator } from '../../common/utils/nuit.validator';

@Injectable()
export class EntidadesService {
  constructor(
    @InjectRepository(Entidade)
    private repo: Repository<Entidade>,
  ) {}

  async findByEmpresa(empresaId: string, tipo?: string): Promise<Entidade[]> {
    const where: any = { empresaId };
    if (tipo) {
      where.tipo = tipo;
    }
    return this.repo.find({ where });
  }

  async findOne(id: string, empresaId: string): Promise<Entidade | null> {
    return this.repo.findOne({ where: { id, empresaId } });
  }

  /**
   * Busca entidades por NUIT ou Nome (B2B)
   */
  async search(
    empresaId: string,
    query: string,
    tipo?: string,
    limit: number = 10,
  ): Promise<Entidade[]> {
    const cleanQuery = query.replace(/\D/g, '');
    const where: any = { empresaId };
    
    if (tipo) {
      where.tipo = tipo;
    }

    // Se parece NUIT (apenas números), busca por NUIT
    if (/^\d+$/.test(query) && cleanQuery.length >= 3) {
      const byNuit = await this.repo.find({
        where: { ...where, nuit: Like(`${cleanQuery}%`) },
        take: limit,
      });
      if (byNuit.length > 0) return byNuit;
    }

    // Busca por nome
    return this.repo.find({
      where: { ...where, nome: Like(`%${query}%`) },
      take: limit,
    });
  }

  async create(data: Partial<Entidade>): Promise<Entidade> {
    // Valida NUIT se fornecido
    if (data.nuit) {
      const cleanNuit = NuitValidator.clean(data.nuit);
      if (!NuitValidator.isValid(cleanNuit)) {
        throw new BadRequestException(`NUIT inválido: ${data.nuit}`);
      }
      data.nuit = cleanNuit;
    }

    const entidade = this.repo.create(data);
    return this.repo.save(entidade);
  }

  async update(id: string, empresaId: string, data: Partial<Entidade>): Promise<Entidade> {
    // Valida NUIT se fornecido
    if (data.nuit) {
      const cleanNuit = NuitValidator.clean(data.nuit);
      if (!NuitValidator.isValid(cleanNuit)) {
        throw new BadRequestException(`NUIT inválido: ${data.nuit}`);
      }
      data.nuit = cleanNuit;
    }

    await this.repo.update({ id, empresaId }, data);
    return this.findOne(id, empresaId);
  }
}
