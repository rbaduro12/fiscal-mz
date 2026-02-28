import { Controller, Get, Post, Param, Query, UseGuards, Req, Res, HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { IvaReportService } from '../services/iva-report.service';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { EmpresasService } from '../../empresas/services/empresas.service';
import { Logger } from '@nestjs/common';

@Controller('fiscal/iva')
@UseGuards(JwtAuthGuard)
export class IvaReportController {
  private readonly logger = new Logger(IvaReportController.name);

  constructor(
    private readonly ivaService: IvaReportService,
    private readonly pdfService: PdfGeneratorService,
    private readonly empresasService: EmpresasService,
  ) {}

  /**
   * Gerar Modelo A para um período
   * POST /fiscal/iva/modelo-a/:ano/:mes
   */
  @Post('modelo-a/:ano/:mes')
  async gerarModeloA(
    @Param('ano') ano: string,
    @Param('mes') mes: string,
    @Req() req: any,
  ) {
    const empresaId = req.user.empresaId;
    this.logger.log(`Gerando Modelo A: ${mes}/${ano} para empresa ${empresaId}`);
    return this.ivaService.gerarModeloA(empresaId, parseInt(ano), parseInt(mes));
  }

  /**
   * Listar todas as declarações da empresa
   * GET /fiscal/iva/declaracoes
   */
  @Get('declaracoes')
  async listarDeclaracoes(@Req() req: any) {
    const empresaId = req.user.empresaId;
    return this.ivaService.listarDeclaracoes(empresaId);
  }

  /**
   * Gerar XML do Modelo A para download
   * GET /fiscal/iva/modelo-a/:ano/:mes/xml
   */
  @Get('modelo-a/:ano/:mes/xml')
  async downloadXML(
    @Param('ano') ano: string,
    @Param('mes') mes: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const empresaId = req.user.empresaId;
      this.logger.log(`Gerando XML: ${mes}/${ano} para empresa ${empresaId}`);
      
      const xml = await this.ivaService.gerarXML(empresaId, parseInt(ano), parseInt(mes));

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="modelo-a-${ano}-${mes}.xml"`);
      res.send(xml);
    } catch (error) {
      this.logger.error(`Erro ao gerar XML: ${error.message}`, error.stack);
      throw new HttpException('Erro ao gerar XML', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Gerar PDF do Modelo A com layout oficial
   * GET /fiscal/iva/modelo-a/:ano/:mes/pdf
   */
  @Get('modelo-a/:ano/:mes/pdf')
  async downloadPDF(
    @Param('ano') ano: string,
    @Param('mes') mes: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const empresaId = req.user.empresaId;
      this.logger.log(`Gerando PDF: ${mes}/${ano} para empresa ${empresaId}`);

      // Buscar declaração e empresa
      const declaracao = await this.ivaService.gerarModeloA(empresaId, parseInt(ano), parseInt(mes));
      const empresa = await this.empresasService.findOne(empresaId);

      if (!empresa) {
        throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
      }

      // Gerar PDF
      const pdfBuffer = await this.pdfService.gerarPDFModeloA(declaracao, empresa);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="modelo-a-${ano}-${mes}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.end(pdfBuffer);
    } catch (error) {
      this.logger.error(`Erro ao gerar PDF: ${error.message}`, error.stack);
      throw new HttpException(
        `Erro ao gerar PDF: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obter declaração específica em formato JSON
   * GET /fiscal/iva/declaracoes/:id
   */
  @Get('declaracoes/:id')
  async obterDeclaracao(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const empresaId = req.user.empresaId;
    return this.ivaService.obterDeclaracao(id, empresaId);
  }

  /**
   * Submeter declaração à AT (simulação)
   * POST /fiscal/iva/declaracoes/:id/submeter
   */
  @Post('declaracoes/:id/submeter')
  async submeterDeclaracao(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const empresaId = req.user.empresaId;
    this.logger.log(`Submetendo declaração ${id} para empresa ${empresaId}`);
    return this.ivaService.submeterDeclaracao(id, empresaId);
  }

  /**
   * Obter resumo do período atual
   * GET /fiscal/iva/resumo-atual
   */
  @Get('resumo-atual')
  async getResumoAtual(@Req() req: any) {
    const empresaId = req.user.empresaId;
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth() + 1;
    
    return this.ivaService.gerarModeloA(empresaId, ano, mes);
  }

  /**
   * Exportar declaração em múltiplos formatos
   * GET /fiscal/iva/declaracoes/:id/export?format=pdf|xml
   */
  @Get('declaracoes/:id/export')
  async exportarDeclaracao(
    @Param('id') id: string,
    @Query('formato') formato: 'pdf' | 'xml',
    @Req() req: any,
    @Res() res: Response,
  ) {
    const empresaId = req.user.empresaId;
    const declaracao = await this.ivaService.obterDeclaracao(id, empresaId);

    if (formato === 'xml') {
      const xml = await this.ivaService.gerarXML(empresaId, declaracao.periodoAno, declaracao.periodoMes);
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="modelo-a-${declaracao.periodoAno}-${declaracao.periodoMes}.xml"`);
      return res.send(xml);
    }

    if (formato === 'pdf') {
      const empresa = await this.empresasService.findOne(empresaId);
      const pdfBuffer = await this.pdfService.gerarPDFModeloA(declaracao, empresa);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="modelo-a-${declaracao.periodoAno}-${declaracao.periodoMes}.pdf"`);
      return res.end(pdfBuffer);
    }

    throw new HttpException('Formato não suportado. Use pdf ou xml', HttpStatus.BAD_REQUEST);
  }
}
