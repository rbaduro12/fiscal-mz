import { Controller, Get, Post, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { EmpresasService } from '../services/empresas.service';
import { Empresa } from '../entities/empresa.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { NuitValidator } from '../../common/utils/nuit.validator';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';

@Controller('empresas')
@UseGuards(JwtAuthGuard)
export class EmpresasController {
  constructor(private readonly service: EmpresasService) {}

  @Get()
  findAll(): Promise<Empresa[]> {
    return this.service.findAll();
  }

  @Get('search')
  @RateLimit(30, 60) // 30 requests por minuto (prevenir scraping)
  async search(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
  ): Promise<Empresa[]> {
    if (!query || query.length < 3) {
      throw new BadRequestException('Query deve ter pelo menos 3 caracteres');
    }
    return this.service.search(query, Math.min(limit, 20));
  }

  @Get('validate-nuit/:nuit')
  validateNuit(@Param('nuit') nuit: string): { valid: boolean; formatted: string } {
    const cleanNuit = NuitValidator.clean(nuit);
    const isValid = NuitValidator.isValid(cleanNuit);
    return {
      valid: isValid,
      formatted: isValid ? NuitValidator.format(cleanNuit) : cleanNuit,
    };
  }

  @Get('me')
  getCurrentCompany(@CurrentUser() user: any): Promise<Empresa> {
    return this.service.findOne(user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Empresa> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() data: Partial<Empresa>): Promise<Empresa> {
    // Valida NUIT
    if (data.nuit) {
      const cleanNuit = NuitValidator.clean(data.nuit);
      if (!NuitValidator.isValid(cleanNuit)) {
        throw new BadRequestException('NUIT inválido');
      }
      data.nuit = cleanNuit;
    }
    return this.service.create(data);
  }
}
