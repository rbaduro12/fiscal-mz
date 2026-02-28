import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Documento, TipoDocumento, EstadoDocumento } from '../../documentos/entities/documento.entity';
import { LinhaDocumento } from '../../documentos/entities/linha-documento.entity';
import { Notificacao, TipoNotificacao } from '../../notificacoes/entities/notificacao.entity';

// DTOs
export interface CriarCotacaoDTO {
  entidadeId: string;
  itens: Array<{
    artigoId?: string;
    descricao: string;
    quantidade: number;
    precoUnitario: number;
    taxaIva?: number;
    descontoPercentual?: number;
  }>;
  observacoes?: string;
  dataValidade?: Date;
}

export interface DadosPagamentoDTO {
  metodo: string;
  referencia?: string;
  utilizadorId: string;
}

@Injectable()
export class DocumentoWorkflowService {
  constructor(
    @InjectRepository(Documento)
    private documentoRepo: Repository<Documento>,
    @InjectRepository(LinhaDocumento)
    private linhaRepo: Repository<LinhaDocumento>,
    @InjectRepository(Notificacao)
    private notificacaoRepo: Repository<Notificacao>,
    private dataSource: DataSource,
  ) {}

  /**
   * FLUXO 1: Criar Cotação
   * Empresa A cria cotação para Empresa B
   */
  async criarCotacao(dados: CriarCotacaoDTO, empresaId: string, utilizadorId: string): Promise<Documento> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calcular totais com IVA 16% (Lei 10/2025)
      const totais = this.calcularTotais(dados.itens);

      // Criar documento cotação
      const cotacao = this.documentoRepo.create({
        empresaId,
        utilizadorId,
        entidadeId: dados.entidadeId,
        tipo: TipoDocumento.COTACAO,
        estado: EstadoDocumento.EMITIDA,
        dataEmissao: new Date(),
        dataValidade: dados.dataValidade || this.calcularDataValidade(30),
        observacoes: dados.observacoes,
        subtotal: totais.subtotal,
        totalDescontos: totais.totalDescontos,
        totalIva: totais.totalIva,
        totalPagar: totais.totalPagar,
        operacaoIva: 'TRIBUTAVEL_16' as any,
      });

      const cotacaoSalva = await queryRunner.manager.save(cotacao);

      // Inserir linhas
      for (let i = 0; i < dados.itens.length; i++) {
        const item = dados.itens[i];
        const linha = this.linhaRepo.create({
          documentoId: cotacaoSalva.id,
          artigoId: item.artigoId,
          descricao: item.descricao,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          taxaIva: item.taxaIva || 16, // IVA 16% por padrão
          valorIva: this.calcularIVA(item.precoUnitario, item.quantidade, item.taxaIva || 16),
          descontoPercentual: item.descontoPercentual || 0,
          totalLinha: this.calcularTotalLinha(item),
          ordem: i + 1,
        });
        await queryRunner.manager.save(linha);
      }

      // Notificar destinatário (empresa cliente)
      await this.criarNotificacao({
        empresaDestinatarioId: dados.entidadeId,
        tipo: TipoNotificacao.COTACAO_RECEBIDA,
        documentoId: cotacaoSalva.id,
        titulo: `Nova Cotação ${cotacaoSalva.numeroCompleto}`,
        mensagem: `Recebeu uma cotação no valor de ${totais.totalPagar.toLocaleString('pt-MZ')} MZN. Válida até ${cotacaoSalva.dataValidade.toLocaleDateString('pt-MZ')}.`,
        acaoUrl: `/portal/cotacoes/${cotacaoSalva.id}`,
        acaoTexto: 'Ver Cotação',
      }, queryRunner.manager);

      await queryRunner.commitTransaction();
      
      return this.documentoRepo.findOne({
        where: { id: cotacaoSalva.id },
        relations: ['linhas', 'entidade'],
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * FLUXO 2: Aceitar Cotação
   * Cliente (Empresa B) aceita → Gera Proforma
   */
  async aceitarCotacao(cotacaoId: string, empresaClienteId: string): Promise<Documento> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar cotação
      const cotacao = await this.documentoRepo.findOne({
        where: { id: cotacaoId, entidadeId: empresaClienteId },
        relations: ['linhas', 'empresa'],
      });

      if (!cotacao) {
        throw new NotFoundException('Cotação não encontrada');
      }

      if (cotacao.estado !== EstadoDocumento.EMITIDA) {
        throw new BadRequestException(`Cotação não pode ser aceite. Estado: ${cotacao.estado}`);
      }

      // Verificar validade
      if (new Date() > cotacao.dataValidade) {
        throw new BadRequestException('Cotação expirada');
      }

      // Atualizar cotação
      cotacao.estado = EstadoDocumento.ACEITE;
      await queryRunner.manager.save(cotacao);

      // Criar proforma
      const proforma = this.documentoRepo.create({
        empresaId: cotacao.empresaId,
        entidadeId: cotacao.entidadeId,
        tipo: TipoDocumento.PROFORMA,
        estado: EstadoDocumento.EMITIDA,
        documentoOrigemId: cotacao.id,
        dataEmissao: new Date(),
        dataVencimento: this.calcularDataValidade(15), // 15 dias para pagar
        subtotal: cotacao.subtotal,
        totalDescontos: cotacao.totalDescontos,
        totalIva: cotacao.totalIva,
        totalPagar: cotacao.totalPagar,
        operacaoIva: cotacao.operacaoIva,
      });

      const proformaSalva = await queryRunner.manager.save(proforma);

      // Copiar linhas
      for (const linha of cotacao.linhas) {
        const novaLinha = this.linhaRepo.create({
          documentoId: proformaSalva.id,
          artigoId: linha.artigoId,
          descricao: linha.descricao,
          quantidade: linha.quantidade,
          precoUnitario: linha.precoUnitario,
          taxaIva: linha.taxaIva,
          valorIva: linha.valorIva,
          descontoPercentual: linha.descontoPercentual,
          totalLinha: linha.totalLinha,
          ordem: linha.ordem,
        });
        await queryRunner.manager.save(novaLinha);
      }

      // Notificar empresa vendedora
      await this.criarNotificacao({
        empresaDestinatarioId: cotacao.empresaId,
        tipo: TipoNotificacao.COTACAO_ACEITE,
        documentoId: cotacao.id,
        titulo: 'Cotação Aceite',
        mensagem: `A sua cotação ${cotacao.numeroCompleto} foi aceite e convertida em proforma ${proformaSalva.numeroCompleto}.`,
        acaoUrl: `/proformas/${proformaSalva.id}`,
        acaoTexto: 'Ver Proforma',
      }, queryRunner.manager);

      // Notificar cliente sobre proforma
      await this.criarNotificacao({
        empresaDestinatarioId: empresaClienteId,
        tipo: TipoNotificacao.PROFORMA_EMITIDA,
        documentoId: proformaSalva.id,
        titulo: 'Proforma para Pagamento',
        mensagem: `A proforma ${proformaSalva.numeroCompleto} no valor de ${proformaSalva.totalPagar.toLocaleString('pt-MZ')} MZN está disponível. Vencimento: ${proformaSalva.dataVencimento.toLocaleDateString('pt-MZ')}.`,
        acaoUrl: `/portal/proformas/${proformaSalva.id}`,
        acaoTexto: 'Pagar Agora',
      }, queryRunner.manager);

      await queryRunner.commitTransaction();
      return proformaSalva;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * FLUXO 3: Processar Pagamento
   * Gera Factura + Recibo + Movimenta Stock
   */
  async processarPagamento(
    proformaId: string,
    dadosPagamento: DadosPagamentoDTO,
    empresaId: string,
  ): Promise<{ factura: Documento; recibo: Documento }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar proforma
      const proforma = await this.documentoRepo.findOne({
        where: { id: proformaId, empresaId },
        relations: ['linhas', 'entidade'],
      });

      if (!proforma || proforma.tipo !== TipoDocumento.PROFORMA) {
        throw new NotFoundException('Proforma não encontrada');
      }

      if (proforma.estado !== EstadoDocumento.EMITIDA) {
        throw new BadRequestException('Proforma já processada');
      }

      // Registrar pagamento
      await queryRunner.manager.query(
        `INSERT INTO pagamentos (documento_id, entidade_id, metodo, valor, referencia_externa, estado, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, 'CONFIRMADO', $6, NOW())`,
        [proformaId, proforma.entidadeId, dadosPagamento.metodo, proforma.totalPagar, dadosPagamento.referencia || null, dadosPagamento.utilizadorId],
      );

      // Atualizar proforma
      proforma.estado = EstadoDocumento.PAGA;
      proforma.dataPagamento = new Date();
      await queryRunner.manager.save(proforma);

      // Emitir FACTURA FISCAL
      const factura = this.documentoRepo.create({
        empresaId,
        entidadeId: proforma.entidadeId,
        tipo: TipoDocumento.FACTURA,
        estado: EstadoDocumento.EMITIDA,
        documentoOrigemId: proforma.id,
        dataEmissao: new Date(),
        subtotal: proforma.subtotal,
        totalDescontos: proforma.totalDescontos,
        totalIva: proforma.totalIva,
        totalPagar: proforma.totalPagar,
        operacaoIva: proforma.operacaoIva,
        entidadeNome: proforma.entidade?.nome,
        entidadeNuit: proforma.entidade?.nuit,
      });

      const facturaSalva = await queryRunner.manager.save(factura);

      // Copiar linhas e movimentar stock
      for (const linha of proforma.linhas) {
        const novaLinha = this.linhaRepo.create({
          documentoId: facturaSalva.id,
          artigoId: linha.artigoId,
          descricao: linha.descricao,
          quantidade: linha.quantidade,
          precoUnitario: linha.precoUnitario,
          taxaIva: linha.taxaIva,
          valorIva: linha.valorIva,
          descontoPercentual: linha.descontoPercentual,
          totalLinha: linha.totalLinha,
          ordem: linha.ordem,
          movimentouStock: true,
          quantidadeStockMovimentada: linha.quantidade,
        });
        await queryRunner.manager.save(novaLinha);

        // Movimentar stock (saída)
        if (linha.artigoId) {
          await queryRunner.manager.query(
            `SELECT movimentar_stock($1, $2, $3, $4, $5, $6, $7, $8)`,
            [empresaId, linha.artigoId, facturaSalva.id, 'SAIDA', linha.quantidade, 'FACTURA', facturaSalva.numeroCompleto, dadosPagamento.utilizadorId]
          );
        }
      }

      // Emitir RECIBO
      const recibo = this.documentoRepo.create({
        empresaId,
        entidadeId: proforma.entidadeId,
        tipo: TipoDocumento.RECIBO,
        estado: EstadoDocumento.EMITIDA,
        documentoOrigemId: facturaSalva.id,
        dataEmissao: new Date(),
        totalPagar: proforma.totalPagar,
      });

      const reciboSalvo = await queryRunner.manager.save(recibo);

      // Notificações
      await this.criarNotificacao({
        empresaDestinatarioId: empresaId,
        tipo: TipoNotificacao.PAGAMENTO_CONFIRMADO,
        documentoId: proforma.id,
        titulo: 'Pagamento Confirmado',
        mensagem: `Pagamento da proforma ${proforma.numeroCompleto} confirmado. Factura ${facturaSalva.numeroCompleto} emitida.`,
      }, queryRunner.manager);

      await this.criarNotificacao({
        empresaDestinatarioId: proforma.entidadeId,
        tipo: TipoNotificacao.FACTURA_EMITIDA,
        documentoId: facturaSalva.id,
        titulo: 'Factura Disponível',
        mensagem: `A factura ${facturaSalva.numeroCompleto} e recibo ${reciboSalvo.numeroCompleto} foram emitidos.`,
        acaoUrl: `/portal/facturas/${facturaSalva.id}`,
        acaoTexto: 'Download PDF',
      }, queryRunner.manager);

      await queryRunner.commitTransaction();

      return { factura: facturaSalva, recibo: reciboSalvo };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Métodos auxiliares
  private calcularTotais(itens: any[]): any {
    let subtotal = 0;
    let totalDescontos = 0;
    let totalIva = 0;

    for (const item of itens) {
      const totalLinha = item.precoUnitario * item.quantidade;
      const desconto = totalLinha * (item.descontoPercentual || 0) / 100;
      const baseIva = totalLinha - desconto;
      const iva = baseIva * (item.taxaIva || 16) / 100;

      subtotal += totalLinha;
      totalDescontos += desconto;
      totalIva += iva;
    }

    return {
      subtotal,
      totalDescontos,
      totalIva,
      totalPagar: subtotal - totalDescontos + totalIva,
    };
  }

  private calcularIVA(precoUnitario: number, quantidade: number, taxa: number): number {
    return (precoUnitario * quantidade) * (taxa / 100);
  }

  private calcularTotalLinha(item: any): number {
    const total = item.precoUnitario * item.quantidade;
    const desconto = total * (item.descontoPercentual || 0) / 100;
    return total - desconto;
  }

  private calcularDataValidade(dias: number): Date {
    const data = new Date();
    data.setDate(data.getDate() + dias);
    return data;
  }

  private async criarNotificacao(dados: Partial<Notificacao>, manager: any): Promise<void> {
    const notificacao = this.notificacaoRepo.create(dados);
    await manager.save(notificacao);
  }

  /**
   * Listar cotações da empresa
   */
  async listarCotacoes(empresaId: string, tipo: 'enviadas' | 'recebidas'): Promise<Documento[]> {
    if (tipo === 'enviadas') {
      return this.documentoRepo.find({
        where: { empresaId, tipo: TipoDocumento.COTACAO },
        relations: ['entidade', 'linhas'],
        order: { createdAt: 'DESC' },
      });
    } else {
      // Recebidas = cotações onde a empresa é a entidade (cliente)
      return this.documentoRepo.find({
        where: { entidadeId: empresaId, tipo: TipoDocumento.COTACAO },
        relations: ['empresa', 'linhas'],
        order: { createdAt: 'DESC' },
      });
    }
  }

  /**
   * Listar proformas pendentes de pagamento
   */
  async listarProformasPendentes(empresaId: string): Promise<Documento[]> {
    return this.documentoRepo.find({
      where: { 
        empresaId, 
        tipo: TipoDocumento.PROFORMA, 
        estado: EstadoDocumento.EMITIDA 
      },
      relations: ['entidade', 'linhas'],
      order: { dataVencimento: 'ASC' },
    });
  }

  /**
   * Rejeitar cotação
   */
  async rejeitarCotacao(cotacaoId: string, empresaClienteId: string, motivo?: string): Promise<Documento> {
    const cotacao = await this.documentoRepo.findOne({
      where: { id: cotacaoId, entidadeId: empresaClienteId },
    });

    if (!cotacao) {
      throw new NotFoundException('Cotação não encontrada');
    }

    if (cotacao.estado !== EstadoDocumento.EMITIDA) {
      throw new BadRequestException('Cotação não pode ser rejeitada');
    }

    cotacao.estado = EstadoDocumento.REJEITADA;
    cotacao.observacoes = motivo ? `Rejeitado: ${motivo}` : 'Rejeitado pelo cliente';
    
    const saved = await this.documentoRepo.save(cotacao);

    // Notificar empresa emissora
    await this.notificacaoRepo.save({
      empresaDestinatarioId: cotacao.empresaId,
      tipo: TipoNotificacao.COTACAO_REJEITADA,
      documentoId: cotacao.id,
      titulo: 'Cotação Rejeitada',
      mensagem: `A cotação ${cotacao.numeroCompleto} foi rejeitada${motivo ? `: ${motivo}` : ''}`,
    });

    return saved;
  }

  /**
   * Estatísticas do dashboard
   */
  async getDashboardStats(empresaId: string): Promise<any> {
    const [
      cotacoesPendentes,
      cotacoesEnviadasMes,
      proformasPendentes,
      faturasMes,
      totalFaturadoMes,
    ] = await Promise.all([
      // Cotações pendentes de resposta
      this.documentoRepo.count({
        where: { empresaId, tipo: TipoDocumento.COTACAO, estado: EstadoDocumento.EMITIDA },
      }),
      // Cotações enviadas este mês
      this.documentoRepo.count({
        where: { 
          empresaId, 
          tipo: TipoDocumento.COTACAO,
          createdAt: this.getInicioMes(),
        },
      }),
      // Proformas pendentes
      this.documentoRepo.count({
        where: { empresaId, tipo: TipoDocumento.PROFORMA, estado: EstadoDocumento.EMITIDA },
      }),
      // Faturas emitidas este mês
      this.documentoRepo.count({
        where: { 
          empresaId, 
          tipo: TipoDocumento.FACTURA,
          createdAt: this.getInicioMes(),
        },
      }),
      // Total faturado este mês
      this.documentoRepo
        .createQueryBuilder('d')
        .where('d.empresaId = :empresaId', { empresaId })
        .andWhere('d.tipo = :tipo', { tipo: TipoDocumento.FACTURA })
        .andWhere('d.createdAt >= :inicioMes', { inicioMes: this.getInicioMes() })
        .select('SUM(d.totalPagar)', 'total')
        .getRawOne(),
    ]);

    return {
      cotacoesPendentes,
      cotacoesEnviadasMes,
      proformasPendentes,
      faturasMes,
      totalFaturadoMes: parseFloat(totalFaturadoMes?.total || 0),
    };
  }

  private getInicioMes(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}
