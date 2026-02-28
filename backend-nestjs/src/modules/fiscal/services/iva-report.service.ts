import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Documento, TipoDocumento, TipoOperacaoIVA } from '../../documentos/entities/documento.entity';
import { DeclaracaoIVA, EstadoDeclaracao } from '../entities/declaracao-iva.entity';
import { Empresa } from '../../empresas/entities/empresa.entity';

@Injectable()
export class IvaReportService {
  private readonly logger = new Logger(IvaReportService.name);

  constructor(
    @InjectRepository(Documento)
    private documentoRepo: Repository<Documento>,
    @InjectRepository(DeclaracaoIVA)
    private declaracaoRepo: Repository<DeclaracaoIVA>,
    @InjectRepository(Empresa)
    private empresaRepo: Repository<Empresa>,
    private dataSource: DataSource,
  ) {}

  /**
   * Gerar Modelo A - Declaração Periódica de IVA
   */
  async gerarModeloA(empresaId: string, ano: number, mes: number): Promise<DeclaracaoIVA> {
    const empresa = await this.empresaRepo.findOne({ where: { id: empresaId } });
    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Calcular período
    const inicioPeriodo = new Date(ano, mes - 1, 1);
    const fimPeriodo = new Date(ano, mes, 0, 23, 59, 59);

    // Buscar ou criar declaração
    let declaracao = await this.declaracaoRepo.findOne({
      where: { empresaId, periodoAno: ano, periodoMes: mes },
    });

    if (!declaracao) {
      declaracao = this.declaracaoRepo.create({
        empresaId,
        periodoAno: ano,
        periodoMes: mes,
        estado: EstadoDeclaracao.RASCUNHO,
      });
    }

    // Calcular todos os quadros
    const q1 = await this.calcularQuadro01(empresaId, inicioPeriodo, fimPeriodo);
    const q2 = await this.calcularQuadro02(empresaId, inicioPeriodo, fimPeriodo);
    const q3 = await this.calcularQuadro03(empresaId, inicioPeriodo, fimPeriodo);
    const q4 = await this.calcularQuadro04(empresaId, inicioPeriodo, fimPeriodo);
    const q5 = await this.calcularQuadro05(empresaId, inicioPeriodo, fimPeriodo);

    // Calcular apuramento (Quadro 06)
    const ivaLiquidado = q1.totalIva16 + (q2.bensIva10 + q2.servicosIva10) + (q3.bensIva5 + q3.servicosIva5);
    const ivaDedutivel = q5.totalIvaDedutivel;
    const diferenca = ivaLiquidado - ivaDedutivel;

    // Buscar crédito do período anterior
    const creditoAnterior = await this.getCreditoPeriodoAnterior(empresaId, ano, mes);

    let ivaAPagar = 0;
    let creditoTransportar = 0;

    if (diferenca > 0) {
      ivaAPagar = Math.max(0, diferenca - creditoAnterior);
      creditoTransportar = Math.max(0, creditoAnterior - diferenca);
    } else {
      creditoTransportar = Math.abs(diferenca) + creditoAnterior;
    }

    // Atualizar declaração
    Object.assign(declaracao, {
      q1VendasBens16: q1.vendasBens16,
      q1VendasBensIva: q1.vendasBensIva,
      q1VendasServicos16: q1.vendasServicos16,
      q1VendasServicosIva: q1.vendasServicosIva,
      q1TotalBase16: q1.totalBase16,
      q1TotalIva16: q1.totalIva16,

      q2Bens10: q2.bens10,
      q2BensIva10: q2.bensIva10,
      q2Servicos10: q2.servicos10,
      q2ServicosIva10: q2.servicosIva10,

      q3Bens5: q3.bens5,
      q3BensIva5: q3.bensIva5,
      q3Servicos5: q3.servicos5,
      q3ServicosIva5: q3.servicosIva5,

      q4Exportacoes: q4.exportacoes,
      q4IsentosArtigo15: q4.isentosArtigo15,
      q4NaoSujeitos: q4.naoSujeitos,

      q5ComprasBens16: q5.comprasBens16,
      q5ComprasBensIva16: q5.comprasBensIva16,
      q5ComprasServicos16: q5.comprasServicos16,
      q5ComprasServicosIva16: q5.comprasServicosIva16,
      q5ImportacoesBens: q5.importacoesBens,
      q5ImportacoesIva: q5.importacoesIva,
      q5Compras5: q5.compras5,
      q5ComprasIva5: q5.comprasIva5,

      q6IvaLiquidado: ivaLiquidado,
      q6IvaDedutivel: ivaDedutivel,
      q6Diferenca: diferenca,
      q6CreditoPeriodoAnterior: creditoAnterior,
      q6IvaAPagar: ivaAPagar,
      q6CreditoTransportar: creditoTransportar,
    });

    return this.declaracaoRepo.save(declaracao);
  }

  private async calcularQuadro01(empresaId: string, inicio: Date, fim: Date) {
    const result = await this.dataSource.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN a.tipo = 'PRODUTO' THEN ld.total_linha ELSE 0 END), 0) as vendas_bens_16,
        COALESCE(SUM(CASE WHEN a.tipo = 'PRODUTO' THEN ld.valor_iva ELSE 0 END), 0) as vendas_bens_iva,
        COALESCE(SUM(CASE WHEN a.tipo = 'SERVICO' THEN ld.total_linha ELSE 0 END), 0) as vendas_servicos_16,
        COALESCE(SUM(CASE WHEN a.tipo = 'SERVICO' THEN ld.valor_iva ELSE 0 END), 0) as vendas_servicos_iva
      FROM documentos d
      JOIN linhas_documento ld ON d.id = ld.documento_id
      LEFT JOIN artigos a ON ld.artigo_id = a.id
      WHERE d.empresa_id = $1 
        AND d.tipo IN ('FACTURA', 'FACTURA_RECIBO')
        AND d.estado = 'EMITIDA'
        AND d.anulado = FALSE
        AND d.operacao_iva = 'TRIBUTAVEL_16'
        AND d.data_emissao BETWEEN $2 AND $3
      `,
      [empresaId, inicio, fim],
    );

    const row = result[0];
    const vendasBens16 = parseFloat(row.vendas_bens_16) || 0;
    const vendasBensIva = parseFloat(row.vendas_bens_iva) || 0;
    const vendasServicos16 = parseFloat(row.vendas_servicos_16) || 0;
    const vendasServicosIva = parseFloat(row.vendas_servicos_iva) || 0;

    return {
      vendasBens16,
      vendasBensIva,
      vendasServicos16,
      vendasServicosIva,
      totalBase16: vendasBens16 + vendasServicos16,
      totalIva16: vendasBensIva + vendasServicosIva,
    };
  }

  private async calcularQuadro02(empresaId: string, inicio: Date, fim: Date) {
    const result = await this.dataSource.query(
      `
      SELECT 
        COALESCE(SUM(ld.total_linha), 0) as total_10,
        COALESCE(SUM(ld.valor_iva), 0) as total_iva_10
      FROM documentos d
      JOIN linhas_documento ld ON d.id = ld.documento_id
      WHERE d.empresa_id = $1 
        AND d.tipo IN ('FACTURA', 'FACTURA_RECIBO')
        AND d.estado = 'EMITIDA'
        AND d.anulado = FALSE
        AND d.operacao_iva = 'TRIBUTAVEL_10'
        AND d.data_emissao BETWEEN $2 AND $3
      `,
      [empresaId, inicio, fim],
    );

    const row = result[0];
    return {
      bens10: parseFloat(row.total_10) || 0,
      bensIva10: parseFloat(row.total_iva_10) || 0,
      servicos10: 0,
      servicosIva10: 0,
    };
  }

  private async calcularQuadro03(empresaId: string, inicio: Date, fim: Date) {
    const result = await this.dataSource.query(
      `
      SELECT 
        COALESCE(SUM(ld.total_linha), 0) as total_5,
        COALESCE(SUM(ld.valor_iva), 0) as total_iva_5
      FROM documentos d
      JOIN linhas_documento ld ON d.id = ld.documento_id
      WHERE d.empresa_id = $1 
        AND d.tipo IN ('FACTURA', 'FACTURA_RECIBO')
        AND d.estado = 'EMITIDA'
        AND d.anulado = FALSE
        AND d.operacao_iva = 'TRIBUTAVEL_5'
        AND d.data_emissao BETWEEN $2 AND $3
      `,
      [empresaId, inicio, fim],
    );

    const row = result[0];
    return {
      bens5: parseFloat(row.total_5) || 0,
      bensIva5: parseFloat(row.total_iva_5) || 0,
      servicos5: 0,
      servicosIva5: 0,
    };
  }

  private async calcularQuadro04(empresaId: string, inicio: Date, fim: Date) {
    const result = await this.dataSource.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'EXPORTACAO' THEN ld.total_linha ELSE 0 END), 0) as exportacoes,
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'ISENTO' THEN ld.total_linha ELSE 0 END), 0) as isentos,
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'NAO_SUJEITO' THEN ld.total_linha ELSE 0 END), 0) as nao_sujeitos
      FROM documentos d
      JOIN linhas_documento ld ON d.id = ld.documento_id
      WHERE d.empresa_id = $1 
        AND d.tipo IN ('FACTURA', 'FACTURA_RECIBO')
        AND d.estado = 'EMITIDA'
        AND d.anulado = FALSE
        AND d.data_emissao BETWEEN $2 AND $3
      `,
      [empresaId, inicio, fim],
    );

    const row = result[0];
    return {
      exportacoes: parseFloat(row.exportacoes) || 0,
      isentosArtigo15: parseFloat(row.isentos) || 0,
      naoSujeitos: parseFloat(row.nao_sujeitos) || 0,
    };
  }

  private async calcularQuadro05(empresaId: string, inicio: Date, fim: Date) {
    const result = await this.dataSource.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'TRIBUTAVEL_16' AND a.tipo = 'PRODUTO' THEN ld.total_linha ELSE 0 END), 0) as compras_bens_16,
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'TRIBUTAVEL_16' AND a.tipo = 'PRODUTO' THEN ld.valor_iva ELSE 0 END), 0) as compras_bens_iva_16,
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'TRIBUTAVEL_16' AND a.tipo = 'SERVICO' THEN ld.total_linha ELSE 0 END), 0) as compras_servicos_16,
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'TRIBUTAVEL_16' AND a.tipo = 'SERVICO' THEN ld.valor_iva ELSE 0 END), 0) as compras_servicos_iva_16,
        COALESCE(SUM(CASE WHEN d.pais_origem IS NOT NULL AND d.pais_origem != 'MZ' THEN ld.total_linha ELSE 0 END), 0) as importacoes,
        COALESCE(SUM(CASE WHEN d.pais_origem IS NOT NULL AND d.pais_origem != 'MZ' THEN ld.valor_iva ELSE 0 END), 0) as importacoes_iva,
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'TRIBUTAVEL_5' THEN ld.total_linha ELSE 0 END), 0) as compras_5,
        COALESCE(SUM(CASE WHEN d.operacao_iva = 'TRIBUTAVEL_5' THEN ld.valor_iva ELSE 0 END), 0) as compras_iva_5
      FROM documentos d
      JOIN linhas_documento ld ON d.id = ld.documento_id
      LEFT JOIN artigos a ON ld.artigo_id = a.id
      WHERE d.empresa_id = $1 
        AND d.tipo = 'FACTURA'
        AND d.estado = 'EMITIDA'
        AND d.anulado = FALSE
        AND d.data_emissao BETWEEN $2 AND $3
      `,
      [empresaId, inicio, fim],
    );

    const row = result[0];
    const comprasBens16 = parseFloat(row.compras_bens_16) || 0;
    const comprasBensIva16 = parseFloat(row.compras_bens_iva_16) || 0;
    const comprasServicos16 = parseFloat(row.compras_servicos_16) || 0;
    const comprasServicosIva16 = parseFloat(row.compras_servicos_iva_16) || 0;
    const importacoesBens = parseFloat(row.importacoes) || 0;
    const importacoesIva = parseFloat(row.importacoes_iva) || 0;
    const compras5 = parseFloat(row.compras_5) || 0;
    const comprasIva5 = parseFloat(row.compras_iva_5) || 0;

    return {
      comprasBens16,
      comprasBensIva16,
      comprasServicos16,
      comprasServicosIva16,
      importacoesBens,
      importacoesIva,
      compras5,
      comprasIva5,
      totalIvaDedutivel: comprasBensIva16 + comprasServicosIva16 + importacoesIva + comprasIva5,
    };
  }

  private async getCreditoPeriodoAnterior(empresaId: string, ano: number, mes: number): Promise<number> {
    let mesAnterior = mes - 1;
    let anoAnterior = ano;

    if (mesAnterior === 0) {
      mesAnterior = 12;
      anoAnterior = ano - 1;
    }

    const result = await this.declaracaoRepo.findOne({
      where: { empresaId, periodoAno: anoAnterior, periodoMes: mesAnterior },
    });

    return result?.q6CreditoTransportar || 0;
  }

  async gerarXML(empresaId: string, ano: number, mes: number): Promise<string> {
    const declaracao = await this.gerarModeloA(empresaId, ano, mes);
    const empresa = await this.empresaRepo.findOne({ where: { id: empresaId } });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ModeloA xmlns="http://www.at.gov.mz/iva/v1">
  <Cabecalho>
    <NUIT>${empresa.nuit}</NUIT>
    <NomeContribuinte>${empresa.nomeFiscal}</NomeContribuinte>
    <Periodo>${mes.toString().padStart(2, '0')}/${ano}</Periodo>
    <Regime>${empresa.regime}</Regime>
  </Cabecalho>
  <Quadro01>
    <VendasBens16>${declaracao.q1VendasBens16.toFixed(2)}</VendasBens16>
    <IVABens16>${declaracao.q1VendasBensIva.toFixed(2)}</IVABens16>
    <VendasServicos16>${declaracao.q1VendasServicos16.toFixed(2)}</VendasServicos16>
    <IVAServicos16>${declaracao.q1VendasServicosIva.toFixed(2)}</IVAServicos16>
    <TotalBase16>${declaracao.q1TotalBase16.toFixed(2)}</TotalBase16>
    <TotalIVA16>${declaracao.q1TotalIva16.toFixed(2)}</TotalIVA16>
  </Quadro01>
  <Quadro02>
    <Bens10>${declaracao.q2Bens10.toFixed(2)}</Bens10>
    <IVABens10>${declaracao.q2BensIva10.toFixed(2)}</IVABens10>
    <Servicos10>${declaracao.q2Servicos10.toFixed(2)}</Servicos10>
    <IVAServicos10>${declaracao.q2ServicosIva10.toFixed(2)}</IVAServicos10>
  </Quadro02>
  <Quadro03>
    <Bens5>${declaracao.q3Bens5.toFixed(2)}</Bens5>
    <IVABens5>${declaracao.q3BensIva5.toFixed(2)}</IVABens5>
    <Servicos5>${declaracao.q3Servicos5.toFixed(2)}</Servicos5>
    <IVAServicos5>${declaracao.q3ServicosIva5.toFixed(2)}</IVAServicos5>
  </Quadro03>
  <Quadro04>
    <Exportacoes>${declaracao.q4Exportacoes.toFixed(2)}</Exportacoes>
    <IsentosArt15>${declaracao.q4IsentosArtigo15.toFixed(2)}</IsentosArt15>
    <NaoSujeitos>${declaracao.q4NaoSujeitos.toFixed(2)}</NaoSujeitos>
  </Quadro04>
  <Quadro05>
    <ComprasBens16>${declaracao.q5ComprasBens16.toFixed(2)}</ComprasBens16>
    <IVAComprasBens16>${declaracao.q5ComprasBensIva16.toFixed(2)}</IVAComprasBens16>
    <ComprasServicos16>${declaracao.q5ComprasServicos16.toFixed(2)}</ComprasServicos16>
    <IVAComprasServicos16>${declaracao.q5ComprasServicosIva16.toFixed(2)}</IVAComprasServicos16>
    <Importacoes>${declaracao.q5ImportacoesBens.toFixed(2)}</Importacoes>
    <IVAImportacoes>${declaracao.q5ImportacoesIva.toFixed(2)}</IVAImportacoes>
    <Compras5>${declaracao.q5Compras5.toFixed(2)}</Compras5>
    <IVACompras5>${declaracao.q5ComprasIva5.toFixed(2)}</IVACompras5>
  </Quadro05>
  <Quadro06>
    <IVALiquidado>${declaracao.q6IvaLiquidado.toFixed(2)}</IVALiquidado>
    <IVADedutivel>${declaracao.q6IvaDedutivel.toFixed(2)}</IVADedutivel>
    <Diferenca>${declaracao.q6Diferenca.toFixed(2)}</Diferenca>
    <CreditoAnterior>${declaracao.q6CreditoPeriodoAnterior.toFixed(2)}</CreditoAnterior>
    <IVAPagar>${declaracao.q6IvaAPagar.toFixed(2)}</IVAPagar>
    <CreditoTransportar>${declaracao.q6CreditoTransportar.toFixed(2)}</CreditoTransportar>
  </Quadro06>
</ModeloA>`;

    declaracao.xmlGerado = xml;
    await this.declaracaoRepo.save(declaracao);

    return xml;
  }

  async listarDeclaracoes(empresaId: string): Promise<DeclaracaoIVA[]> {
    return this.declaracaoRepo.find({
      where: { empresaId },
      order: { periodoAno: 'DESC', periodoMes: 'DESC' },
    });
  }

  /**
   * Obter uma declaração específica
   */
  async obterDeclaracao(id: string, empresaId: string): Promise<DeclaracaoIVA> {
    const declaracao = await this.declaracaoRepo.findOne({
      where: { id, empresaId },
    });

    if (!declaracao) {
      throw new Error('Declaração não encontrada');
    }

    return declaracao;
  }

  /**
   * Submeter declaração à AT (simulação)
   */
  async submeterDeclaracao(id: string, empresaId: string): Promise<DeclaracaoIVA> {
    const declaracao = await this.obterDeclaracao(id, empresaId);

    if (declaracao.estado === 'SUBMETIDA') {
      throw new Error('Declaração já foi submetida');
    }

    // Gerar código de validação único
    const codigoValidacao = this.gerarCodigoValidacao();

    declaracao.estado = EstadoDeclaracao.SUBMETIDA;
    declaracao.dataSubmissao = new Date();
    declaracao.numeroConfirmacaoAT = codigoValidacao;

    await this.declaracaoRepo.save(declaracao);

    this.logger.log(`Declaração ${id} submetida com código ${codigoValidacao}`);

    return declaracao;
  }

  /**
   * Gera um código de validação único
   */
  private gerarCodigoValidacao(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AT-${timestamp}-${random}`;
  }
}
