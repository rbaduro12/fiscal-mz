import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cotacao, CotacaoStatus } from '../../entities/cotacao.entity';
import { EventStore, EventType } from '../../entities/event-store.entity';
import { GenerateProformaCommand } from '../impl/generate-proforma.command';
import { Documento, TipoDocumento, EstadoDocumento } from '../../../documentos/entities/documento.entity';
import { NotificacoesGateway } from '../../../notificacoes/gateways/notificacoes.gateway';
import { TipoNotificacao } from '../../../notificacoes/entities/notificacao.entity';

@Injectable()
export class GenerateProformaHandler {
  constructor(
    @InjectRepository(Cotacao)
    private cotacaoRepo: Repository<Cotacao>,
    @InjectRepository(Documento)
    private documentoRepo: Repository<Documento>,
    @InjectRepository(EventStore)
    private eventStore: Repository<EventStore>,
    private dataSource: DataSource,
    private notificacoesGateway: NotificacoesGateway,
  ) {}

  async execute(command: GenerateProformaCommand): Promise<Documento> {
    const { cotacaoId, tenantId } = command;

    const cotacao = await this.cotacaoRepo.findOne({
      where: { id: cotacaoId, tenantId },
      relations: ['itens'],
    });

    if (!cotacao) {
      throw new NotFoundException('Cotação não encontrada');
    }

    if (cotacao.status !== CotacaoStatus.ACEITE) {
      throw new BadRequestException('Cotação deve estar aceite para gerar proforma');
    }

    if (cotacao.proformaId) {
      throw new BadRequestException('Proforma já gerada para esta cotação');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Gerar número da proforma
      const numero = await this.gerarNumeroProforma(tenantId);

      // Criar proforma baseada na cotação
      const proforma = this.documentoRepo.create({
        empresaId: tenantId,
        entidadeId: cotacao.clienteId,
        tipo: TipoDocumento.PROFORMA,
        estado: EstadoDocumento.EMITIDA,
        numeroCompleto: numero,
        documentoOrigemId: cotacao.id,
        subtotal: cotacao.subtotal,
        totalIva: cotacao.totalIva,
        totalPagar: cotacao.total,
        dataEmissao: new Date(),
        dataVencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
        observacoes: `Gerado a partir da cotação ${cotacao.numero}. ${cotacao.observacoes || ''}`,
      });

      const savedProforma = await queryRunner.manager.save(proforma);

      // Atualizar cotação
      cotacao.proformaId = savedProforma.id;
      cotacao.status = CotacaoStatus.CONVERTIDA;
      await queryRunner.manager.save(cotacao);

      // Registrar evento
      const evento = this.eventStore.create({
        aggregateId: cotacao.id,
        aggregateType: 'Cotacao',
        eventType: EventType.PROFORMA_GENERATED,
        payload: {
          cotacaoId: cotacao.id,
          proformaId: savedProforma.id,
          numero: savedProforma.numeroCompleto,
          total: savedProforma.totalPagar,
        },
      });
      await queryRunner.manager.save(evento);

      await queryRunner.commitTransaction();

      // Notificar cliente
      await this.notificacoesGateway.enviarNotificacaoParaEmpresa(cotacao.clienteId, {
        tipo: TipoNotificacao.PROFORMA_EMITIDA,
        titulo: 'Proforma Pronta para Pagamento',
        mensagem: `A proforma ${numero} no valor de MZN ${cotacao.total.toFixed(2)} está disponível para pagamento.`,
        documentoId: savedProforma.id,
        acaoUrl: `/proformas/${savedProforma.id}/pagar`,
        acaoTexto: 'Pagar Agora',
      });

      return savedProforma;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async gerarNumeroProforma(tenantId: string): Promise<string> {
    const ano = new Date().getFullYear();
    
    const lastProforma = await this.documentoRepo.findOne({
      where: { 
        empresaId: tenantId,
        tipo: TipoDocumento.PROFORMA,
      },
      order: { createdAt: 'DESC' },
    });

    let sequencial = 1;
    if (lastProforma && lastProforma.numeroCompleto) {
      const match = lastProforma.numeroCompleto.match(/\/(\d+)$/);
      if (match) {
        sequencial = parseInt(match[1]) + 1;
      }
    }

    return `PF/${ano}/${String(sequencial).padStart(4, '0')}`;
  }
}
