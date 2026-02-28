import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagamento } from '../entities/pagamento.entity';

@Injectable()
export class PagamentosService {
  constructor(
    @InjectRepository(Pagamento)
    private repo: Repository<Pagamento>,
  ) {}

  async findByDocumento(documentoId: string): Promise<Pagamento[]> {
    return this.repo.find({ 
      where: { documentoId },
      order: { createdAt: 'DESC' }
    });
  }
}
