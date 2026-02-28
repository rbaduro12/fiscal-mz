import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { EntidadesService } from '../services/entidades.service';

@Controller('entidades')
export class EntidadesController {
  constructor(private readonly service: EntidadesService) {}

  @Get()
  findByEmpresa(@Query('empresaId') empresaId: string) {
    return this.service.findByEmpresa(empresaId);
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }
}
