import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento, TipoDocumento, EstadoDocumento } from '../../documentos/entities/documento.entity';
import { StockService } from '../../stock/services/stock.service';
import { NotificacoesGateway } from '../../notificacoes/gateways/notificacoes.gateway';
import { TipoNotificacao } from '../../notificacoes/entities/notificacao.entity';

@Injectable()
export class WorkflowIntegracaoService {
  private readonly logger = new Logger(WorkflowIntegracaoService.name);

  constructor(
    @InjectRepository(Documento)
    private documentoRepo: Repository<Documento>,
    private stockService: StockService,
    private notificacoesGateway: NotificacoesGateway,
  ) {}

  // ============================================
  // INTEGRAÇÃO: COTAÇÃO → PROFORMA
  // ============================================

  async onCotacaoAceita(
    documento: Documento,
    empresaId: string,
    utilizadorId: string,
  ): Promise<void> {
    this.logger.log(`Cotação ${documento.id} aceita - Iniciando integração`);

    // 1. Notificar empresa remetente (quem criou a cotação)
    await this.notificacoesGateway.enviarNotificacaoParaEmpresa(
      documento.empresaId, // Empresa que criou a cotação
      {
        tipo: TipoNotificacao.COTACAO_ACEITE,
        titulo: 'Cotação Aceite',
        mensagem: `A cotação ${documento.numeroCompleto} foi aceita pelo cliente.`,
        documentoId: documento.id,
        acaoUrl: `/documentos/${documento.id}`,
        acaoTexto: 'Ver Documento',
      },
    );

    // 2. Verificar stock para os itens
    const itensStock = documento.linhas
      ?.filter(l => l.artigoId)
      .map(l => ({ artigoId: l.artigoId, quantidade: l.quantidade })) || [];

    if (itensStock.length > 0) {
      const { valido, semStock } = await this.stockService.validarStockDisponivel(
        itensStock,
        empresaId,
      );

      if (!valido) {
        // Alertar sobre stock insuficiente
        await this.notificacoesGateway.enviarNotificacaoParaEmpresa(
          empresaId,
          {
            tipo: TipoNotificacao.STOCK_BAIXO,
            titulo: 'Stock Insuficiente',
            mensagem: `${semStock.length} artigo(s) com stock insuficiente para a cotação aceita.`,
            documentoId: documento.id,
            acaoUrl: '/stock/alertas',
            acaoTexto: 'Ver Alertas',
          },
        );
      }
    }
  }

  // ============================================
  // INTEGRAÇÃO: PROFORMA → PAGAMENTO
  // ============================================

  async onProformaPaga(
    documento: Documento,
    empresaId: string,
  ): Promise<void> {
    this.logger.log(`Proforma ${documento.id} paga - Iniciando integração`);

    // Notificar empresa que emitiu a proforma
    await this.notificacoesGateway.enviarNotificacaoParaEmpresa(
      documento.empresaId,
      {
        tipo: TipoNotificacao.PAGAMENTO_CONFIRMADO,
        titulo: 'Pagamento Confirmado',
        mensagem: `Recebeu pagamento de MZN ${documento.totalPagar} para a proforma ${documento.numeroCompleto}.`,
        documentoId: documento.id,
        acaoUrl: `/documentos/${documento.id}`,
        acaoTexto: 'Ver Documento',
      },
    );
  }

  // ============================================
  // INTEGRAÇÃO: FATURA → STOCK
  // ============================================

  async onFacturaEmitida(
    documento: Documento,
    empresaId: string,
    utilizadorId: string,
  ): Promise<void> {
    this.logger.log(`Fatura ${documento.id} emitida - Movimentando stock`);

    // Movimentar stock de saída para cada item
    const itens = documento.linhas
      ?.filter(l => l.artigoId)
      .map(l => ({
        artigoId: l.artigoId,
        quantidade: l.quantidade,
      })) || [];

    if (itens.length > 0) {
      await this.stockService.movimentarPorDocumento(
        empresaId,
        utilizadorId,
        documento.id,
        itens,
        'saida',
        documento.numeroCompleto,
      );

      this.logger.log(`Stock movimentado para fatura ${documento.numeroCompleto}`);

      // Verificar se algum artigo ficou abaixo do mínimo
      for (const item of itens) {
        const abaixoMinimo = await this.stockService.verificarStockMinimo(
          item.artigoId,
          empresaId,
        );

        if (abaixoMinimo) {
          await this.notificacoesGateway.enviarNotificacaoParaEmpresa(
            empresaId,
            {
              tipo: TipoNotificacao.STOCK_BAIXO,
              titulo: 'Alerta de Stock Baixo',
              mensagem: `O artigo ficou com stock abaixo do mínimo após a fatura ${documento.numeroCompleto}.`,
              documentoId: documento.id,
              acaoUrl: '/stock/alertas',
              acaoTexto: 'Ver Stock',
            },
          );
        }
      }
    }

    // Notificar cliente
    if (documento.entidadeId) {
      // Buscar empresa do cliente (se for B2B)
      const entidade = documento.entidade;
      if (entidade) {
        await this.notificacoesGateway.enviarNotificacaoParaEmpresa(
          empresaId, // Aqui idealmente seria a empresa do cliente
          {
            tipo: TipoNotificacao.FACTURA_EMITIDA,
            titulo: 'Nova Fatura',
            mensagem: `Recebeu a fatura ${documento.numeroCompleto} no valor de MZN ${documento.totalPagar}.`,
            documentoId: documento.id,
            acaoUrl: `/documentos/${documento.id}`,
            acaoTexto: 'Ver Fatura',
          },
        );
      }
    }
  }

  // ============================================
  // INTEGRAÇÃO: DEVOLUÇÃO → STOCK
  // ============================================

  async onNotaCreditoEmitida(
    documento: Documento,
    empresaId: string,
    utilizadorId: string,
  ): Promise<void> {
    this.logger.log(`Nota de Crédito ${documento.id} emitida - Revertendo stock`);

    // Reverter movimentos do documento origem
    if (documento.documentoOrigemId) {
      await this.stockService.reverterMovimentosDocumento(
        documento.documentoOrigemId,
        empresaId,
        utilizadorId,
      );

      this.logger.log(`Stock revertido para nota de crédito ${documento.numeroCompleto}`);
    }
  }

  // ============================================
  // ALERTAS DE VENCIMENTO
  // ============================================

  async verificarDocumentosVencidos(empresaId: string): Promise<void> {
    const hoje = new Date();

    // Buscar proformas pendentes com data de validade próxima
    const proformasVencendo = await this.documentoRepo.find({
      where: {
        empresaId,
        tipo: TipoDocumento.PROFORMA,
        estado: EstadoDocumento.EMITIDA,
        dataValidade: hoje, // Simplificado - na prática seria <= hoje + 3 dias
      },
    });

    for (const proforma of proformasVencendo) {
      await this.notificacoesGateway.enviarNotificacaoParaEmpresa(
        empresaId,
        {
          tipo: TipoNotificacao.DOCUMENTO_VENCIDO,
          titulo: 'Proforma a Vencer',
          mensagem: `A proforma ${proforma.numeroCompleto} vence em breve.`,
          documentoId: proforma.id,
          acaoUrl: `/documentos/${proforma.id}`,
          acaoTexto: 'Ver Proforma',
        },
      );
    }
  }

  // ============================================
  // NOTIFICAÇÃO B2B: ENTRE EMPRESAS
  // ============================================

  async enviarMensagemB2B(
    empresaRemetenteId: string,
    empresaDestinatarioId: string,
    titulo: string,
    mensagem: string,
    documentoId?: string,
  ): Promise<void> {
    this.logger.log(`Mensagem B2B de ${empresaRemetenteId} para ${empresaDestinatarioId}`);

    await this.notificacoesGateway.enviarNotificacaoParaEmpresa(
      empresaDestinatarioId,
      {
        tipo: TipoNotificacao.COTACAO_RECEBIDA,
        titulo,
        mensagem,
        documentoId,
        acaoUrl: documentoId ? `/documentos/${documentoId}` : '/notificacoes',
        acaoTexto: 'Ver',
      },
    );
  }
}
