import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EmpresasService } from '../services/empresas.service';
import { Empresa } from '../entities/empresa.entity';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly service: EmpresasService) {}

  @Get()
  findAll(): Promise<Empresa[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Empresa> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Empresa>): Promise<Empresa> {
    return this.service.create(data);
  }
}
