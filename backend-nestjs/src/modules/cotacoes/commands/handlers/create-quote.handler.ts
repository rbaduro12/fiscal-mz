import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cotacao, CotacaoStatus } from '../../entities/cotacao.entity';
import { ItemCotacao } from '../../entities/item-cotacao.entity';
import { EventStore, EventType } from '../../entities/event-store.entity';
import { CreateQuoteCommand } from '../impl/create-quote.command';
import { NotificacoesGateway } from '../../../notificacoes/gateways/notificacoes.gateway';
import { TipoNotificacao } from '../../../notificacoes/entities/notificacao.entity';
import { Artigo } from '../../../artigos/entities/artigo.entity';

@Injectable()
export class CreateQuoteHandler {
  constructor(
    @InjectRepository(Cotacao)
    private cotacaoRepo: Repository<Cotacao>,
    @InjectRepository(EventStore)
    private eventStore: Repository<EventStore>,
    @InjectRepository(Artigo)
    private artigoRepo: Repository<Artigo>,
    private dataSource: DataSource,
    private notificacoesGateway: NotificacoesGateway,
  ) {}

  async execute(command: CreateQuoteCommand): Promise<Cotacao> {
    const { data, vendedorId } = command;
    const { tenantId, clienteId, itens, validadeDias = 30, observacoes, idempotencyKey } = data;

    // Verificar idempotência
    if (idempotencyKey) {
      const existing = await this.eventStore.findOne({
        where: {
          metadata: { idempotencyKey },
        },
      });
      if (existing) {
        throw new ConflictException('Cotação já processada com esta chave');
      }
    }

    // Validar itens
    if (!itens || itens.length === 0) {
      throw new BadRequestException('Cotação deve ter pelo menos um item');
    }

    for (const item of itens) {
      if (item.quantidade <= 0) {
        throw new BadRequestException(`Quantidade inválida para o item ${item.descricao}`);
      }
      if (item.precoUnitario < 0) {
        throw new BadRequestException(`Preço inválido para o item ${item.descricao}`);
      }

      // Verificar stock se for produto
      const artigo = await this.artigoRepo.findOne({
        where: { id: item.artigoId, empresaId: tenantId },
      });

      if (artigo && artigo.tipo === 'PRODUTO') {
        if (artigo.stockAtual < item.quantidade) {
          throw new BadRequestException(
            `Stock insuficiente para ${artigo.descricao}. Disponível: ${artigo.stockAtual}`
          );
        }
      }
    }

    // Calcular totais
    let subtotal = 0;
    let totalIva = 0;

    const itensCalculados = itens.map((item) => {
      const quantidade = Number(item.quantidade);
      const precoUnitario = Number(item.precoUnitario);
      const desconto = Number(item.desconto || 0);
      const taxaIva = Number(item.taxaIva || 16);

      const valorDesconto = (quantidade * precoUnitario * desconto) / 100;
      const valorSemIva = quantidade * precoUnitario - valorDesconto;
      const valorIva = (valorSemIva * taxaIva) / 100;
      const totalLinha = valorSemIva + valorIva;

      subtotal += valorSemIva;
      totalIva += valorIva;

      return {
        ...item,
        totalLinha,
        ivaLinha: valorIva,
      };
    });

    const total = subtotal + totalIva;

    // Gerar número da cotação
    const numero = await this.gerarNumeroCotacao(tenantId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Criar cotação
      const cotacao = this.cotacaoRepo.create({
        tenantId,
        vendedorId,
        clienteId,
        numero,
        status: CotacaoStatus.ENVIADA,
        subtotal,
        totalIva,
        total,
        validadeDias,
        dataExpiracao: new Date(Date.now() + validadeDias * 24 * 60 * 60 * 1000),
        observacoes,
        itens: itensCalculados.map((item) =>
          Object.assign(new ItemCotacao(), item),
        ),
      });

      const saved = await queryRunner.manager.save(cotacao);

      // Registrar evento
      const evento = this.eventStore.create({
        aggregateId: saved.id,
        aggregateType: 'Cotacao',
        eventType: EventType.QUOTE_CREATED,
        payload: {
          cotacaoId: saved.id,
          numero: saved.numero,
          clienteId,
          total: saved.total,
          itens: itensCalculados,
        },
        metadata: {
          idempotencyKey,
          userAgent: 'api',
        },
        userId: vendedorId,
      });
      await queryRunner.manager.save(evento);

      await queryRunner.commitTransaction();

      // Notificar cliente via WebSocket (fora da transação)
      try {
        await this.notificacoesGateway.enviarNotificacaoParaEmpresa(tenantId, {
          tipo: TipoNotificacao.COTACAO_RECEBIDA,
          titulo: 'Nova Cotação Recebida',
          mensagem: `Recebeu a cotação ${numero} no valor de MZN ${total.toFixed(2)}`,
          documentoId: saved.id,
          acaoUrl: `/cotacoes/${saved.id}`,
          acaoTexto: 'Ver Cotação',
        });
      } catch (notifyError) {
        // Log but don't fail the request
        console.log('Notificação não enviada:', notifyError.message);
      }

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async gerarNumeroCotacao(tenantId: string): Promise<string> {
    const ano = new Date().getFullYear();
    
    // Buscar última cotação do tenant
    const lastQuote = await this.cotacaoRepo.findOne({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });

    let sequencial = 1;
    if (lastQuote && lastQuote.numero) {
      const match = lastQuote.numero.match(/\/(\d+)$/);
      if (match) {
        sequencial = parseInt(match[1]) + 1;
      }
    }

    return `CQ/${ano}/${String(sequencial).padStart(4, '0')}`;
  }
}
