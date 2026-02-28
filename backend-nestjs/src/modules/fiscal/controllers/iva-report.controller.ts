import { Controller, Get, Post, Param, Query, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { IvaReportService } from '../services/iva-report.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('fiscal/iva')
@UseGuards(JwtAuthGuard)
export class IvaReportController {
  constructor(private readonly ivaService: IvaReportService) {}

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
    const empresaId = req.user.empresaId;
    const xml = await this.ivaService.gerarXML(empresaId, parseInt(ano), parseInt(mes));

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="modelo-a-${ano}-${mes}.xml"`);
    res.send(xml);
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
}
