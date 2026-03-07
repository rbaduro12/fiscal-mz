import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Empresa } from '../entities/empresa.entity';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private repo: Repository<Empresa>,
  ) {}

  async findAll(): Promise<Empresa[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Empresa> {
    return this.repo.findOne({ where: { id } });
  }

  async findByNuit(nuit: string): Promise<Empresa | null> {
    return this.repo.findOne({ where: { nuit } });
  }

  /**
   * Busca empresas por NUIT ou Nome (B2B)
   * Usado para auto-complete ao criar cotação
   */
  async search(query: string, limit: number = 10): Promise<Empresa[]> {
    const cleanQuery = query.replace(/\D/g, '');
    
    // Se parece NUIT (apenas números), busca por NUIT
    if (/^\d+$/.test(query) && cleanQuery.length >= 3) {
      const byNuit = await this.repo.find({
        where: { nuit: Like(`${cleanQuery}%`) },
        take: limit,
      });
      if (byNuit.length > 0) return byNuit;
    }

    // Busca por nome fiscal ou comercial
    return this.repo.find({
      where: [
        { nomeFiscal: Like(`%${query}%`) },
        { nomeComercial: Like(`%${query}%`) },
      ],
      take: limit,
    });
  }

  async create(data: Partial<Empresa>): Promise<Empresa> {
    const empresa = this.repo.create(data);
    return this.repo.save(empresa);
  }

  async update(id: string, data: Partial<Empresa>): Promise<Empresa> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
}
