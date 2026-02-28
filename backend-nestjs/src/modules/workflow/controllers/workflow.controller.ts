import { Controller, Post, Body, Param, Get, Query, UseGuards, Req } from '@nestjs/common';
import { DocumentoWorkflowService } from '../services/documento-workflow.service';
import { CriarCotacaoDTO, DadosPagamentoDTO } from '../dto/criar-cotacao.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('workflow')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  constructor(private readonly workflowService: DocumentoWorkflowService) {}

  /**
   * Criar nova cotação
   * POST /workflow/cotacoes
   */
  @Post('cotacoes')
  async criarCotacao(
    @Body() dto: CriarCotacaoDTO,
    @Req() req: any,
  ) {
    const empresaId = req.user.empresaId;
    const utilizadorId = req.user.userId;
    
    return this.workflowService.criarCotacao(dto, empresaId, utilizadorId);
  }

  /**
   * Aceitar cotação (cliente)
   * POST /workflow/cotacoes/:id/aceitar
   */
  @Post('cotacoes/:id/aceitar')
  async aceitarCotacao(
    @Param('id') cotacaoId: string,
    @Req() req: any,
  ) {
    const empresaClienteId = req.user.empresaId;
    return this.workflowService.aceitarCotacao(cotacaoId, empresaClienteId);
  }

  /**
   * Rejeitar cotação (cliente)
   * POST /workflow/cotacoes/:id/rejeitar
   */
  @Post('cotacoes/:id/rejeitar')
  async rejeitarCotacao(
    @Param('id') cotacaoId: string,
    @Body('motivo') motivo: string,
    @Req() req: any,
  ) {
    const empresaClienteId = req.user.empresaId;
    return this.workflowService.rejeitarCotacao(cotacaoId, empresaClienteId, motivo);
  }

  /**
   * Processar pagamento de proforma
   * POST /workflow/proformas/:id/pagar
   */
  @Post('proformas/:id/pagar')
  async pagarProforma(
    @Param('id') proformaId: string,
    @Body() dadosPagamento: DadosPagamentoDTO,
    @Req() req: any,
  ) {
    const empresaId = req.user.empresaId;
    const utilizadorId = req.user.userId;
    
    return this.workflowService.processarPagamento(
      proformaId, 
      { ...dadosPagamento, utilizadorId }, 
      empresaId
    );
  }

  /**
   * Listar cotações da empresa
   * GET /workflow/cotacoes?tipo=enviadas|recebidas
   */
  @Get('cotacoes')
  async listarCotacoes(
    @Query('tipo') tipo: 'enviadas' | 'recebidas' = 'enviadas',
    @Req() req: any,
  ) {
    const empresaId = req.user.empresaId;
    return this.workflowService.listarCotacoes(empresaId, tipo);
  }

  /**
   * Listar proformas pendentes de pagamento
   * GET /workflow/proformas/pendentes
   */
  @Get('proformas/pendentes')
  async listarProformasPendentes(@Req() req: any) {
    const empresaId = req.user.empresaId;
    return this.workflowService.listarProformasPendentes(empresaId);
  }

  /**
   * Obter estatísticas do dashboard
   * GET /workflow/dashboard/stats
   */
  @Get('dashboard/stats')
  async getDashboardStats(@Req() req: any) {
    const empresaId = req.user.empresaId;
    return this.workflowService.getDashboardStats(empresaId);
  }
}
