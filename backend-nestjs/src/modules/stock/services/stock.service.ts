import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { MovimentoStock, TipoMovimentoStock } from '../entities/movimento-stock.entity';
import { Artigo, TipoArtigo } from '../../artigos/entities/artigo.entity';

export interface MovimentoStockInput {
  artigoId: string;
  quantidade: number;
  tipo: TipoMovimentoStock;
  documentoId?: string;
  observacoes?: string;
  referencia?: string;
}

export interface AjusteStockInput {
  artigoId: string;
  quantidadeReal: number;
  motivo: string;
  documentoId?: string;
}

export interface ResumoStock {
  artigoId: string;
  codigo: string;
  descricao: string;
  stockAtual: number;
  stockMinimo: number;
  stockMaximo: number;
  valorTotal: number;
  ultimaEntrada?: Date;
  ultimaSaida?: Date;
}

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    @InjectRepository(MovimentoStock)
    private movimentoRepo: Repository<MovimentoStock>,
    private dataSource: DataSource,
  ) {}

  // ============================================
  // CONSULTAS
  // ============================================

  async getMovimentos(artigoId: string, empresaId: string): Promise<MovimentoStock[]> {
    return this.movimentoRepo.find({
      where: { artigoId, empresaId },
      order: { createdAt: 'DESC' },
      relations: ['artigo', 'documento'],
      take: 100,
    });
  }

  async getMovimentosPorPeriodo(
    empresaId: string,
    inicio: Date,
    fim: Date,
  ): Promise<MovimentoStock[]> {
    return this.movimentoRepo.find({
      where: {
        empresaId,
        createdAt: Between(inicio, fim),
      },
      order: { createdAt: 'DESC' },
      relations: ['artigo'],
    });
  }

  async getStockAtual(artigoId: string, empresaId: string): Promise<number> {
    const artigo = await this.dataSource.getRepository(Artigo).findOne({
      where: { id: artigoId, empresaId },
    });
    return artigo?.stockAtual || 0;
  }

  async getResumoStock(empresaId: string): Promise<ResumoStock[]> {
    const artigos = await this.dataSource.getRepository(Artigo).find({
      where: { empresaId, tipo: TipoArtigo.PRODUTO },
      order: { descricao: 'ASC' },
    });

    const resumo: ResumoStock[] = [];

    for (const artigo of artigos) {
      // Buscar últimas movimentações
      const ultimaEntrada = await this.movimentoRepo.findOne({
        where: {
          artigoId: artigo.id,
          empresaId,
          tipo: TipoMovimentoStock.ENTRADA,
        },
        order: { createdAt: 'DESC' },
      });

      const ultimaSaida = await this.movimentoRepo.findOne({
        where: {
          artigoId: artigo.id,
          empresaId,
          tipo: TipoMovimentoStock.SAIDA,
        },
        order: { createdAt: 'DESC' },
      });

      resumo.push({
        artigoId: artigo.id,
        codigo: artigo.codigo,
        descricao: artigo.descricao,
        stockAtual: artigo.stockAtual,
        stockMinimo: artigo.stockMinimo,
        stockMaximo: artigo.stockMaximo,
        valorTotal: artigo.stockAtual * artigo.precoCusto,
        ultimaEntrada: ultimaEntrada?.createdAt,
        ultimaSaida: ultimaSaida?.createdAt,
      });
    }

    return resumo;
  }

  async getAlertasStock(empresaId: string): Promise<ResumoStock[]> {
    const resumo = await this.getResumoStock(empresaId);
    
    return resumo.filter(item => 
      item.stockAtual <= item.stockMinimo || item.stockAtual === 0
    );
  }

  // ============================================
  // OPERAÇÕES DE STOCK
  // ============================================

  async registrarMovimento(
    empresaId: string,
    utilizadorId: string,
    input: MovimentoStockInput,
  ): Promise<MovimentoStock> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar artigo
      const artigo = await queryRunner.manager.findOne(Artigo, {
        where: { id: input.artigoId, empresaId },
      });

      if (!artigo) {
        throw new NotFoundException('Artigo não encontrado');
      }

      if (artigo.tipo !== TipoArtigo.PRODUTO) {
        throw new BadRequestException('Apenas produtos movimentam stock');
      }

      // Calcular stock anterior e atual
      const stockAnterior = artigo.stockAtual;
      let stockAtual = stockAnterior;

      if (input.tipo === TipoMovimentoStock.ENTRADA) {
        stockAtual += input.quantidade;
      } else if (input.tipo === TipoMovimentoStock.SAIDA) {
        if (stockAnterior < input.quantidade) {
          throw new BadRequestException(
            `Stock insuficiente. Disponível: ${stockAnterior}, Solicitado: ${input.quantidade}`
          );
        }
        stockAtual -= input.quantidade;
      } else if (input.tipo === TipoMovimentoStock.AJUSTE) {
        stockAtual = input.quantidade; // Ajuste define o valor exato
      }

      // Atualizar artigo
      await queryRunner.manager.update(Artigo, artigo.id, {
        stockAtual,
      });

      // Criar movimento
      const movimento = queryRunner.manager.create(MovimentoStock, {
        ...input,
        empresaId,
        utilizadorId,
        stockAnterior,
        stockPosterior: stockAtual,
        createdBy: utilizadorId,
      });

      const salvo = await queryRunner.manager.save(movimento);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Movimento ${input.tipo}: ${artigo.codigo} | ${stockAnterior} -> ${stockAtual} (${input.quantidade})`
      );

      return salvo;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async ajustarStock(
    empresaId: string,
    utilizadorId: string,
    input: AjusteStockInput,
  ): Promise<MovimentoStock> {
    const artigo = await this.dataSource.getRepository(Artigo).findOne({
      where: { id: input.artigoId, empresaId },
    });

    if (!artigo) {
      throw new NotFoundException('Artigo não encontrado');
    }

    const diferenca = input.quantidadeReal - artigo.stockAtual;
    const tipo = diferenca >= 0 ? TipoMovimentoStock.AJUSTE_POSITIVO : TipoMovimentoStock.AJUSTE_NEGATIVO;

    return this.registrarMovimento(empresaId, utilizadorId, {
      artigoId: input.artigoId,
      quantidade: Math.abs(diferenca),
      tipo,
      documentoId: input.documentoId,
      observacoes: `Ajuste: ${artigo.stockAtual} -> ${input.quantidadeReal}. Motivo: ${input.motivo}`,
    });
  }

  async entradaStock(
    empresaId: string,
    utilizadorId: string,
    artigoId: string,
    quantidade: number,
    observacoes?: string,
    referencia?: string,
    documentoId?: string,
  ): Promise<MovimentoStock> {
    return this.registrarMovimento(empresaId, utilizadorId, {
      artigoId,
      quantidade,
      tipo: TipoMovimentoStock.ENTRADA,
      observacoes,
      referencia,
      documentoId,
    });
  }

  async saidaStock(
    empresaId: string,
    utilizadorId: string,
    artigoId: string,
    quantidade: number,
    observacoes?: string,
    referencia?: string,
    documentoId?: string,
  ): Promise<MovimentoStock> {
    return this.registrarMovimento(empresaId, utilizadorId, {
      artigoId,
      quantidade,
      tipo: TipoMovimentoStock.SAIDA,
      observacoes,
      referencia,
      documentoId,
    });
  }

  // ============================================
  // VALIDAÇÕES
  // ============================================

  async validarStockDisponivel(
    itens: { artigoId: string; quantidade: number }[],
    empresaId: string,
  ): Promise<{ valido: boolean; semStock: any[] }> {
    const semStock = [];

    for (const item of itens) {
      if (!item.artigoId) continue;

      const artigo = await this.dataSource.getRepository(Artigo).findOne({
        where: { id: item.artigoId, empresaId, tipo: TipoArtigo.PRODUTO },
      });

      if (!artigo) continue;

      if (artigo.stockAtual < item.quantidade) {
        semStock.push({
          artigoId: artigo.id,
          codigo: artigo.codigo,
          descricao: artigo.descricao,
          solicitado: item.quantidade,
          disponivel: artigo.stockAtual,
          falta: item.quantidade - artigo.stockAtual,
        });
      }
    }

    return {
      valido: semStock.length === 0,
      semStock,
    };
  }

  async verificarStockMinimo(artigoId: string, empresaId: string): Promise<boolean> {
    const artigo = await this.dataSource.getRepository(Artigo).findOne({
      where: { id: artigoId, empresaId },
    });

    if (!artigo) return false;

    return artigo.stockAtual <= artigo.stockMinimo;
  }

  // ============================================
  // MOVIMENTAÇÃO EM LOTE (PARA DOCUMENTOS)
  // ============================================

  async movimentarPorDocumento(
    empresaId: string,
    utilizadorId: string,
    documentoId: string,
    itens: { artigoId: string; quantidade: number }[],
    tipo: 'entrada' | 'saida',
    numeroDocumento?: string,
  ): Promise<MovimentoStock[]> {
    const movimentos: MovimentoStock[] = [];
    const tipoMovimento = tipo === 'entrada' ? TipoMovimentoStock.ENTRADA : TipoMovimentoStock.SAIDA;

    for (const item of itens) {
      const movimento = await this.registrarMovimento(empresaId, utilizadorId, {
        artigoId: item.artigoId,
        quantidade: item.quantidade,
        tipo: tipoMovimento,
        documentoId,
        observacoes: `Documento: ${numeroDocumento || documentoId}`,
      });
      movimentos.push(movimento);
    }

    return movimentos;
  }

  async reverterMovimentosDocumento(
    documentoId: string,
    empresaId: string,
    utilizadorId: string,
  ): Promise<void> {
    const movimentos = await this.movimentoRepo.find({
      where: { documentoId, empresaId },
    });

    for (const mov of movimentos) {
      // Criar movimento inverso
      const tipoInverso = mov.tipo === TipoMovimentoStock.ENTRADA 
        ? TipoMovimentoStock.SAIDA 
        : TipoMovimentoStock.ENTRADA;

      await this.registrarMovimento(empresaId, utilizadorId, {
        artigoId: mov.artigoId,
        quantidade: mov.quantidade,
        tipo: tipoInverso,
        documentoId,
        observacoes: `Reversão do movimento ${mov.id}`,
      });
    }
  }
}
