import { Controller, Get, Post, Body, Query, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { EntidadesService } from '../services/entidades.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';

@Controller('entidades')
@UseGuards(JwtAuthGuard)
export class EntidadesController {
  constructor(private readonly service: EntidadesService) {}

  @Get()
  findByEmpresa(
    @CurrentUser() user: any,
    @Query('tipo') tipo?: string,
  ) {
    return this.service.findByEmpresa(user.empresaId, tipo);
  }

  /**
   * Busca B2B por NUIT ou Nome
   * Usado no auto-complete de cotações
   */
  @Get('search')
  @RateLimit(30, 60)
  async search(
    @CurrentUser() user: any,
    @Query('q') query: string,
    @Query('tipo') tipo?: string,
    @Query('limit') limit: number = 10,
  ) {
    if (!query || query.length < 3) {
      throw new BadRequestException('Query deve ter pelo menos 3 caracteres');
    }
    return this.service.search(user.empresaId, query, tipo, Math.min(limit, 20));
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.service.findOne(id, user.empresaId);
  }

  @Post()
  create(
    @Body() data: any,
    @CurrentUser() user: any,
  ) {
    return this.service.create({ ...data, empresaId: user.empresaId });
  }
}
