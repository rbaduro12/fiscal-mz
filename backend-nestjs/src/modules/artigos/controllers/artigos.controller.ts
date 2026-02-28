import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ArtigosService } from '../services/artigos.service';

@Controller('artigos')
export class ArtigosController {
  constructor(private readonly service: ArtigosService) {}

  @Get()
  findByEmpresa(@Query('empresaId') empresaId: string) {
    return this.service.findByEmpresa(empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }
}
