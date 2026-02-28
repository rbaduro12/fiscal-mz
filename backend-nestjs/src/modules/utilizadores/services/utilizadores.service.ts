import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Utilizador } from '../entities/utilizador.entity';

@Injectable()
export class UtilizadoresService {
  constructor(
    @InjectRepository(Utilizador)
    private repo: Repository<Utilizador>,
  ) {}

  async findByEmail(email: string): Promise<Utilizador> {
    return this.repo.findOne({ where: { email }, relations: ['empresa'] });
  }

  async findById(id: string): Promise<Utilizador> {
    return this.repo.findOne({ where: { id }, relations: ['empresa'] });
  }

  async create(data: Partial<Utilizador>): Promise<Utilizador> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }
}
