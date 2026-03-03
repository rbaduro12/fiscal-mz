import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cotacao, CotacaoStatus } from '../../entities/cotacao.entity';
import { EventStore, EventType } from '../../entities/event-store.entity';
import { AcceptQuoteCommand } from '../impl/accept-quote.command';
import { GenerateProformaCommand } from '../impl/generate-proforma.command';
import { NotificacoesGateway } from '../../../notificacoes/gateways/notificacoes.gateway';
import { TipoNotificacao } from '../../../notificacoes/entities/notificacao.entity';

@Injectable()
export class AcceptQuoteHandler {
  constructor(
    @InjectRepository(Cotacao)
    private cotacaoRepo: Repository<Cotacao>,
    @InjectRepository(EventStore)
    private eventStore: Repository<EventStore>,
    private dataSource: DataSource,
    private notificacoesGateway: NotificacoesGateway,
  ) {}

  async execute(command: AcceptQuoteCommand): Promise<Cotacao> {
    const { cotacaoId, data, clienteId } = command;
    const { negotiatedPrice, observacoes } = data;

    const cotacao = await this.cotacaoRepo.findOne({
      where: { id: cotacaoId },
      relations: ['itens'],
    });

    if (!cotacao) {
      throw new NotFoundException('Cotação não encontrada');
    }

    if (cotacao.clienteId !== clienteId) {
      throw new BadRequestException('Não autorizado a aceitar esta cotação');
    }

    if (cotacao.status === CotacaoStatus.ACEITE || cotacao.status === CotacaoStatus.CONVERTIDA) {
      throw new BadRequestException('Cotação já foi aceite');
    }

    if (cotacao.status === CotacaoStatus.EXPIRADA) {
      throw new BadRequestException('Cotação expirada');
    }

    if (cotacao.dataExpiracao && cotacao.dataExpiracao < new Date()) {
      throw new BadRequestException('Cotação expirada');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let eventType = EventType.QUOTE_ACCEPTED;
      let mensagem = `A cotação ${cotacao.numero} foi aceite`;

      if (negotiatedPrice && negotiatedPrice !== cotacao.total) {
        // Contra-proposta
        cotacao.status = CotacaoStatus.NEGOCIANDO;
        cotacao.metadata = {
          ...cotacao.metadata,
          negotiatedPrice,
          negotiatedBy: clienteId,
          negotiatedAt: new Date(),
        };
        eventType = EventType.QUOTE_NEGOTIATED;
        mensagem = `Contra-proposta recebida para cotação ${cotacao.numero}: MZN ${negotiatedPrice.toFixed(2)}`;
      } else {
        // Aceite direto
        cotacao.status = CotacaoStatus.ACEITE;
        cotacao.dataAceite = new Date();
        
        if (observacoes) {
          cotacao.observacoes = observacoes;
        }
      }

      const saved = await queryRunner.manager.save(cotacao);

      // Registrar evento
      const evento = this.eventStore.create({
        aggregateId: saved.id,
        aggregateType: 'Cotacao',
        eventType,
        payload: {
          cotacaoId: saved.id,
          numero: saved.numero,
          status: saved.status,
          negotiatedPrice,
          total: saved.total,
        },
        userId: clienteId,
      });
      await queryRunner.manager.save(evento);

      await queryRunner.commitTransaction();

      // Notificar vendedor
      await this.notificacoesGateway.enviarNotificacaoParaEmpresa(cotacao.tenantId, {
        tipo: eventType === EventType.QUOTE_ACCEPTED ? TipoNotificacao.COTACAO_ACEITE : TipoNotificacao.COTACAO_NEGOCIADA,
        titulo: eventType === EventType.QUOTE_ACCEPTED ? 'Cotação Aceite' : 'Contra-proposta Recebida',
        mensagem,
        documentoId: saved.id,
        acaoUrl: `/cotacoes/${saved.id}`,
        acaoTexto: 'Ver Detalhes',
      });

      // Se foi aceite direto, gerar proforma automaticamente
      if (cotacao.status === CotacaoStatus.ACEITE) {
        // Disparar comando para gerar proforma (assíncrono)
        setImmediate(async () => {
          try {
            const proformaCmd = new GenerateProformaCommand(saved.id, cotacao.tenantId);
            // Chamar handler de proforma
          } catch (error) {
            console.error('Erro ao gerar proforma:', error);
          }
        });
      }

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
