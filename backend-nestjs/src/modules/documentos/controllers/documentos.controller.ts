import { Controller, Get, Param, Query } from '@nestjs/common';
import { DocumentosService } from '../services/documentos.service';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly service: DocumentosService) {}

  @Get()
  findByEmpresa(@Query('empresaId') empresaId: string) {
    return this.service.findByEmpresa(empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('cliente/:entidadeId')
  findByEntidade(@Param('entidadeId') entidadeId: string) {
    return this.service.findByEntidade(entidadeId);
  }
}
