import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Documento, TipoDocumento, EstadoDocumento } from '../../documentos/entities/documento.entity';
import { DeclaracaoIVA } from '../../fiscal/entities/declaracao-iva.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Documento)
    private documentoRepo: Repository<Documento>,
    @InjectRepository(DeclaracaoIVA)
    private declaracaoRepo: Repository<DeclaracaoIVA>,
  ) {}

  async getResumo(empresaId: string) {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    // Vendas do mês (Faturas)
    const vendasMes = await this.documentoRepo
      .createQueryBuilder('d')
      .select('COALESCE(SUM(d.totalPagar), 0)', 'total')
      .where('d.empresaId = :empresaId', { empresaId })
      .andWhere('d.tipo = :tipo', { tipo: TipoDocumento.FACTURA })
      .andWhere('d.estado IN (:...estados)', { estados: [EstadoDocumento.EMITIDA, EstadoDocumento.PAGA] })
      .andWhere('d.dataEmissao BETWEEN :inicio AND :fim', { inicio: inicioMes, fim: fimMes })
      .getRawOne();

    // Total a receber (Proformas pendentes)
    const aReceber = await this.documentoRepo
      .createQueryBuilder('d')
      .select('COALESCE(SUM(d.totalPagar), 0)', 'total')
      .where('d.empresaId = :empresaId', { empresaId })
      .andWhere('d.tipo = :tipo', { tipo: TipoDocumento.PROFORMA })
      .andWhere('d.estado = :estado', { estado: EstadoDocumento.EMITIDA })
      .getRawOne();

    // Cotações pendentes
    const cotacoesPendentes = await this.documentoRepo.count({
      where: {
        empresaId,
        tipo: TipoDocumento.COTACAO,
        estado: EstadoDocumento.EMITIDA,
      },
    });

    // Total recebido (Recibos do mês)
    const recebido = await this.documentoRepo
      .createQueryBuilder('d')
      .select('COALESCE(SUM(d.totalPagar), 0)', 'total')
      .where('d.empresaId = :empresaId', { empresaId })
      .andWhere('d.tipo = :tipo', { tipo: TipoDocumento.RECIBO })
      .andWhere('d.dataEmissao BETWEEN :inicio AND :fim', { inicio: inicioMes, fim: fimMes })
      .getRawOne();

    // Proformas vencendo (próximos 7 dias)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 7);
    const proformasVencendo = await this.documentoRepo.count({
      where: {
        empresaId,
        tipo: TipoDocumento.PROFORMA,
        estado: EstadoDocumento.EMITIDA,
        dataValidade: Between(hoje, dataLimite),
      },
    });

    return {
      totalVendasMes: parseFloat(vendasMes?.total || '0'),
      totalPendente: parseFloat(aReceber?.total || '0'),
      totalRecebido: parseFloat(recebido?.total || '0'),
      cotacoesPendentes,
      proformasVencendo,
      totalFaturas: 0,
      totalRecibos: 0,
    };
  }

  async getFaturacao(empresaId: string, periodo: string) {
    const dias = parseInt(periodo.replace('d', '')) || 30;
    const hoje = new Date();
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - dias);

    // Agrupar por dia
    const faturas = await this.documentoRepo
      .createQueryBuilder('d')
      .select("TO_CHAR(d.dataEmissao, 'YYYY-MM-DD')", 'data')
      .addSelect('COALESCE(SUM(d.totalPagar), 0)', 'valor')
      .where('d.empresaId = :empresaId', { empresaId })
      .andWhere('d.tipo = :tipo', { tipo: TipoDocumento.FACTURA })
      .andWhere('d.estado IN (:...estados)', { estados: [EstadoDocumento.EMITIDA, EstadoDocumento.PAGA] })
      .andWhere('d.dataEmissao >= :inicio', { inicio })
      .groupBy("TO_CHAR(d.dataEmissao, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(d.dataEmissao, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    const labels = faturas.map(f => f.data);
    const valores = faturas.map(f => parseFloat(f.valor));

    return {
      periodo,
      labels,
      faturado: valores,
      recebido: valores, // Simplificado
      pendente: valores.map(v => 0),
    };
  }

  async getAlertas(empresaId: string) {
    const alertas = [];
    const hoje = new Date();

    // Alerta: Proformas vencendo
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 3);
    
    const proformasVencendo = await this.documentoRepo.count({
      where: {
        empresaId,
        tipo: TipoDocumento.PROFORMA,
        estado: EstadoDocumento.EMITIDA,
        dataValidade: Between(hoje, dataLimite),
      },
    });

    if (proformasVencendo > 0) {
      alertas.push({
        id: '1',
        tipo: 'WARNING',
        titulo: 'Proformas a vencer',
        mensagem: `Você tem ${proformasVencendo} proforma(s) que vencem nos próximos 3 dias.`,
        data: hoje.toISOString(),
      });
    }

    // Alerta: Cotações pendentes
    const cotacoesPendentes = await this.documentoRepo.count({
      where: {
        empresaId,
        tipo: TipoDocumento.COTACAO,
        estado: EstadoDocumento.EMITIDA,
      },
    });

    if (cotacoesPendentes > 0) {
      alertas.push({
        id: '2',
        tipo: 'INFO',
        titulo: 'Cotações pendentes',
        mensagem: `Você tem ${cotacoesPendentes} cotação(ões) aguardando resposta do cliente.`,
        data: hoje.toISOString(),
      });
    }

    return alertas;
  }
}
