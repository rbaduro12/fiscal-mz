import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacao } from '../entities/notificacao.entity';

@Injectable()
export class NotificacoesService {
  constructor(
    @InjectRepository(Notificacao)
    private repo: Repository<Notificacao>,
  ) {}

  async findByEmpresa(empresaId: string): Promise<Notificacao[]> {
    return this.repo.find({
      where: { empresaDestinatarioId: empresaId },
      order: { createdAt: 'DESC' },
      take: 50
    });
  }

  async findNaoLidas(empresaId: string): Promise<Notificacao[]> {
    return this.repo.find({
      where: { empresaDestinatarioId: empresaId, lida: false },
      order: { createdAt: 'DESC' }
    });
  }

  async marcarComoLida(id: string): Promise<void> {
    await this.repo.update(id, { lida: true, dataLeitura: new Date() });
  }
}
