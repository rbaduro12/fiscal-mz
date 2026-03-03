import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { DashboardService } from '../services/dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumo')
  async getResumo(@CurrentUser() user: any) {
    return this.dashboardService.getResumo(user.empresaId);
  }

  @Get('faturacao')
  async getFaturacao(
    @CurrentUser() user: any,
    @Query('periodo') periodo: string = '30d',
  ) {
    return this.dashboardService.getFaturacao(user.empresaId, periodo);
  }

  @Get('alertas')
  async getAlertas(@CurrentUser() user: any) {
    return this.dashboardService.getAlertas(user.empresaId);
  }
}
