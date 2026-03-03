import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cotacao } from '../entities/cotacao.entity';
import { EventStore } from '../entities/event-store.entity';

@Injectable()
export class CotacoesService {
  constructor(
    @InjectRepository(Cotacao)
    private cotacaoRepo: Repository<Cotacao>,
    @InjectRepository(EventStore)
    private eventStore: Repository<EventStore>,
  ) {}

  async findByVendedor(tenantId: string, page: number, limit: number) {
    const [data, total] = await this.cotacaoRepo.findAndCount({
      where: { tenantId },
      relations: ['itens'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByCliente(clienteId: string, page: number, limit: number) {
    const [data, total] = await this.cotacaoRepo.findAndCount({
      where: { clienteId },
      relations: ['itens'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userEmpresaId: string) {
    const cotacao = await this.cotacaoRepo.findOne({
      where: { id },
      relations: ['itens'],
    });

    if (!cotacao) {
      throw new NotFoundException('Cotação não encontrada');
    }

    // Verificar se o usuário tem acesso (vendedor ou cliente)
    if (cotacao.tenantId !== userEmpresaId && cotacao.clienteId !== userEmpresaId) {
      throw new NotFoundException('Cotação não encontrada');
    }

    return cotacao;
  }

  async getWalletBalance(tenantId: string) {
    // Calcular saldo disponível baseado em pagamentos concluídos
    // menos saques já efetuados
    return {
      tenantId,
      saldoDisponivel: 0, // Implementar lógica
      saldoBloqueado: 0,
      totalRecebido: 0,
      totalSacado: 0,
    };
  }

  async requestWithdrawal(tenantId: string, data: { amount: number; bankAccount: string }) {
    // Implementar lógica de saque
    return {
      status: 'PENDENTE',
      amount: data.amount,
      reference: `WD${Date.now()}`,
    };
  }

  async getAuditLog(cotacaoId: string) {
    return this.eventStore.find({
      where: { aggregateId: cotacaoId },
      order: { createdAt: 'ASC' },
    });
  }
}
