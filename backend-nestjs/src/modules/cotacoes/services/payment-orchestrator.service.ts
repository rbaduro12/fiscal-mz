import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Documento, TipoDocumento, EstadoDocumento } from '../../documentos/entities/documento.entity';
import { Pagamento, EstadoPagamento, MetodoPagamento } from '../../payments/entities/pagamento.entity';
import { TipoNotificacao } from '../../notificacoes/entities/notificacao.entity';
import { EventStore, EventType } from '../entities/event-store.entity';
import { NotificacoesGateway } from '../../notificacoes/gateways/notificacoes.gateway';

export interface PaymentRequest {
  proformaId: string;
  method: MetodoPagamento;
  metadata?: {
    phoneNumber?: string;
    reference?: string;
    description?: string;
  };
  idempotencyKey?: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: EstadoPagamento;
  reference?: string;
  instructions?: string;
  qrCode?: string;
}

@Injectable()
export class PaymentOrchestrator {
  constructor(
    @InjectRepository(Documento)
    private documentoRepo: Repository<Documento>,
    @InjectRepository(Pagamento)
    private pagamentoRepo: Repository<Pagamento>,
    @InjectRepository(EventStore)
    private eventStore: Repository<EventStore>,
    private dataSource: DataSource,
    private notificacoesGateway: NotificacoesGateway,
  ) {}

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const { proformaId, method, metadata, idempotencyKey } = request;

    // Verificar idempotência
    if (idempotencyKey) {
      const existing = await this.pagamentoRepo.findOne({
        where: { referenciaExterna: idempotencyKey },
      });
      if (existing) {
        return {
          paymentId: existing.id,
          status: existing.estado,
          reference: existing.referencia,
        };
      }
    }

    const proforma = await this.documentoRepo.findOne({
      where: { id: proformaId, tipo: TipoDocumento.PROFORMA },
    });

    if (!proforma) {
      throw new NotFoundException('Proforma não encontrada');
    }

    if (proforma.estado === EstadoDocumento.PAGA) {
      throw new BadRequestException('Proforma já paga');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let estado: EstadoPagamento;
      let instructions: string | undefined;
      let reference: string | undefined;
      let qrCode: string | undefined;

      // Strategy pattern para diferentes métodos
      switch (method) {
        case MetodoPagamento.MPESA:
          const mpesaResult = await this.processMpesa(proforma, metadata);
          estado = mpesaResult.estado;
          instructions = mpesaResult.instructions;
          reference = mpesaResult.reference;
          break;

        case MetodoPagamento.CASH:
          estado = EstadoPagamento.PENDENTE_CONFIRMACAO;
          instructions = 'Aguardando confirmação do vendedor';
          reference = `CASH-${Date.now()}`;
          break;

        case MetodoPagamento.CARTAO:
          estado = EstadoPagamento.PROCESSANDO;
          instructions = 'Redirecionando para gateway de pagamento';
          reference = `CARD-${Date.now()}`;
          qrCode = await this.generateCardPaymentLink(proforma);
          break;

        case MetodoPagamento.ESCROW:
          estado = EstadoPagamento.PENDENTE_ESCROW;
          instructions = 'Pagamento em garantia. O vendedor será notificado para enviar o produto.';
          reference = `ESCROW-${Date.now()}`;
          break;

        default:
          throw new BadRequestException('Método de pagamento não suportado');
      }

      // Criar registro de pagamento
      const pagamento = this.pagamentoRepo.create({
        documentoId: proforma.id,
        entidadeId: proforma.entidadeId,
        metodo: method,
        valor: proforma.totalPagar,
        estado,
        referencia: reference,
        referenciaExterna: idempotencyKey,
        metadata: {
          ...metadata,
          proformaNumero: proforma.numeroCompleto,
        },
      });

      const saved = await queryRunner.manager.save(pagamento) as Pagamento;

      // Atualizar proforma
      if (method === MetodoPagamento.ESCROW) {
        proforma.estado = EstadoDocumento.EMITIDA; // Mantém emitida até confirmação
        proforma.metadata = {
          ...proforma.metadata,
          escrowPaymentId: saved.id,
          escrowStatus: 'AGUARDANDO_ENVIO',
        };
      } else if (method === MetodoPagamento.CASH) {
        proforma.metadata = {
          ...proforma.metadata,
          cashPaymentId: saved.id,
        };
      }

      await queryRunner.manager.save(proforma);

      // Registrar evento
      const evento = this.eventStore.create({
        aggregateId: proforma.id,
        aggregateType: 'Proforma',
        eventType: EventType.PAYMENT_INITIATED,
        payload: {
          proformaId: proforma.id,
          paymentId: saved.id,
          method,
          valor: proforma.totalPagar,
          estado,
        },
        metadata: { idempotencyKey },
      });
      await queryRunner.manager.save(evento);

      await queryRunner.commitTransaction();

      // Notificar vendedor
      await this.notificacoesGateway.enviarNotificacaoParaEmpresa(proforma.empresaId, {
        tipo: TipoNotificacao.PAGAMENTO_INICIADO,
        titulo: 'Pagamento Iniciado',
        mensagem: `Pagamento de MZN ${proforma.totalPagar.toFixed(2)} iniciado para proforma ${proforma.numeroCompleto}`,
        documentoId: proforma.id,
        acaoUrl: `/proformas/${proforma.id}`,
        acaoTexto: 'Ver Proforma',
      });

      return {
        paymentId: saved.id,
        status: estado,
        reference,
        instructions,
        qrCode,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async processMpesa(
    proforma: Documento,
    metadata?: { phoneNumber?: string },
  ): Promise<{ estado: EstadoPagamento; instructions: string; reference: string }> {
    // Simulação de integração M-Pesa
    // Em produção, chamar API da Vodacom
    
    const reference = `MP${Date.now()}`;
    
    // Verificar se tem número de telefone
    if (!metadata?.phoneNumber) {
      return {
        estado: EstadoPagamento.PENDENTE,
        instructions: 'Aguardando número M-Pesa do cliente',
        reference,
      };
    }

    // Simular chamada API M-Pesa
    // const mpesaResponse = await this.mpesaService.initiatePayment(...);

    return {
      estado: EstadoPagamento.PROCESSANDO,
      instructions: `Confirme o pagamento no seu telemóvel M-Pesa (${metadata.phoneNumber})`,
      reference,
    };
  }

  private async generateCardPaymentLink(proforma: Documento): Promise<string> {
    // Simulação - em produção integrar com Stripe/PayPal
    return `https://pay.example.com/${proforma.id}`;
  }

  async confirmPayment(paymentId: string, gatewayData?: any): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pagamento = await this.pagamentoRepo.findOne({
        where: { id: paymentId },
      });

      if (!pagamento) {
        throw new NotFoundException('Pagamento não encontrado');
      }

      if (pagamento.estado === EstadoPagamento.CONCLUIDO) {
        return; // Já processado
      }

      const proforma = await this.documentoRepo.findOne({
        where: { id: pagamento.documentoId },
      });

      if (!proforma) {
        throw new NotFoundException('Proforma não encontrada');
      }

      // Atualizar pagamento
      pagamento.estado = EstadoPagamento.CONCLUIDO;
      pagamento.dataConfirmacao = new Date();
      pagamento.metadadosGateway = gatewayData;
      await queryRunner.manager.save(pagamento);

      // Atualizar proforma
      proforma.estado = EstadoDocumento.PAGA;
      proforma.dataPagamento = new Date();
      await queryRunner.manager.save(proforma);

      // Se for ESCROW, notificar vendedor para enviar
      if (pagamento.metodo === MetodoPagamento.ESCROW) {
        await this.notificacoesGateway.enviarNotificacaoParaEmpresa(proforma.empresaId, {
          tipo: TipoNotificacao.ESCROW_PAGO,
          titulo: 'Pagamento em Garantia Confirmado',
          mensagem: `Proforma ${proforma.numeroCompleto} paga. Envie o produto para liberar os fundos.`,
          documentoId: proforma.id,
          acaoUrl: `/proformas/${proforma.id}/enviar`,
          acaoTexto: 'Marcar como Enviado',
        });
      }

      // Registrar evento
      const evento = this.eventStore.create({
        aggregateId: proforma.id,
        aggregateType: 'Proforma',
        eventType: EventType.PAYMENT_CONFIRMED,
        payload: {
          proformaId: proforma.id,
          paymentId: pagamento.id,
          valor: pagamento.valor,
          metodo: pagamento.metodo,
        },
      });
      await queryRunner.manager.save(evento);

      await queryRunner.commitTransaction();

      // Notificar ambas as partes
      await this.notificacoesGateway.enviarNotificacaoParaEmpresa(proforma.empresaId, {
        tipo: TipoNotificacao.PAGAMENTO_CONFIRMADO,
        titulo: 'Pagamento Confirmado',
        mensagem: `Proforma ${proforma.numeroCompleto} paga. MZN ${pagamento.valor.toFixed(2)}`,
        documentoId: proforma.id,
      });

      await this.notificacoesGateway.enviarNotificacaoParaEmpresa(proforma.entidadeId, {
        tipo: TipoNotificacao.PAGAMENTO_CONFIRMADO,
        titulo: 'Pagamento Confirmado',
        mensagem: `Pagamento confirmado. Fatura fiscal será gerada em breve.`,
        documentoId: proforma.id,
      });

      // Disparar geração de fatura fiscal (assíncrono)
      setImmediate(async () => {
        // Chamar serviço de faturação
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
