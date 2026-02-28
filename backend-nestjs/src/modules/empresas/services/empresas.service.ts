import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(data: Partial<Empresa>): Promise<Empresa> {
    const empresa = this.repo.create(data);
    return this.repo.save(empresa);
  }
}
