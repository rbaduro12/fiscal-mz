import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { StockService, MovimentoStockInput, AjusteStockInput } from '../services/stock.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly service: StockService) {}

  // ============================================
  // CONSULTAS
  // ============================================

  @Get('movimentos/:artigoId')
  async getMovimentos(
    @Param('artigoId', ParseUUIDPipe) artigoId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.getMovimentos(artigoId, user.empresaId);
  }

  @Get('movimentos')
  async getMovimentosPorPeriodo(
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
    @CurrentUser() user: any,
  ) {
    const dataInicio = inicio ? new Date(inicio) : new Date(new Date().setDate(1));
    const dataFim = fim ? new Date(fim) : new Date();
    return this.service.getMovimentosPorPeriodo(user.empresaId, dataInicio, dataFim);
  }

  @Get('atual/:artigoId')
  async getStockAtual(
    @Param('artigoId', ParseUUIDPipe) artigoId: string,
    @CurrentUser() user: any,
  ) {
    const stock = await this.service.getStockAtual(artigoId, user.empresaId);
    return { artigoId, stockAtual: stock };
  }

  @Get('resumo')
  async getResumoStock(@CurrentUser() user: any) {
    return this.service.getResumoStock(user.empresaId);
  }

  @Get('alertas')
  async getAlertasStock(@CurrentUser() user: any) {
    return this.service.getAlertasStock(user.empresaId);
  }

  // ============================================
  // OPERAÇÕES
  // ============================================

  @Post('entrada')
  async entradaStock(
    @Body() body: {
      artigoId: string;
      quantidade: number;
      observacoes?: string;
      referencia?: string;
      documentoId?: string;
    },
    @CurrentUser() user: any,
  ) {
    if (!body.artigoId || !body.quantidade || body.quantidade <= 0) {
      throw new BadRequestException('Artigo e quantidade válidos são obrigatórios');
    }

    return this.service.entradaStock(
      user.empresaId,
      user.id,
      body.artigoId,
      body.quantidade,
      body.observacoes,
      body.referencia,
      body.documentoId,
    );
  }

  @Post('saida')
  async saidaStock(
    @Body() body: {
      artigoId: string;
      quantidade: number;
      observacoes?: string;
      referencia?: string;
      documentoId?: string;
    },
    @CurrentUser() user: any,
  ) {
    if (!body.artigoId || !body.quantidade || body.quantidade <= 0) {
      throw new BadRequestException('Artigo e quantidade válidos são obrigatórios');
    }

    return this.service.saidaStock(
      user.empresaId,
      user.id,
      body.artigoId,
      body.quantidade,
      body.observacoes,
      body.referencia,
      body.documentoId,
    );
  }

  @Post('ajuste')
  async ajustarStock(
    @Body() body: {
      artigoId: string;
      quantidadeReal: number;
      motivo: string;
      documentoId?: string;
    },
    @CurrentUser() user: any,
  ) {
    if (!body.artigoId || body.quantidadeReal === undefined || body.quantidadeReal < 0) {
      throw new BadRequestException('Artigo e quantidade real válidos são obrigatórios');
    }
    if (!body.motivo) {
      throw new BadRequestException('Motivo do ajuste é obrigatório');
    }

    return this.service.ajustarStock(
      user.empresaId,
      user.id,
      {
        artigoId: body.artigoId,
        quantidadeReal: body.quantidadeReal,
        motivo: body.motivo,
        documentoId: body.documentoId,
      },
    );
  }

  @Post('movimento')
  async registrarMovimento(
    @Body() input: MovimentoStockInput,
    @CurrentUser() user: any,
  ) {
    return this.service.registrarMovimento(user.empresaId, user.id, input);
  }

  // ============================================
  // VALIDAÇÕES
  // ============================================

  @Post('validar')
  async validarStock(
    @Body() body: { itens: { artigoId: string; quantidade: number }[] },
    @CurrentUser() user: any,
  ) {
    return this.service.validarStockDisponivel(body.itens || [], user.empresaId);
  }

  @Get('verificar-minimo/:artigoId')
  async verificarStockMinimo(
    @Param('artigoId', ParseUUIDPipe) artigoId: string,
    @CurrentUser() user: any,
  ) {
    const abaixoMinimo = await this.service.verificarStockMinimo(artigoId, user.empresaId);
    return { artigoId, abaixoMinimo };
  }
}
