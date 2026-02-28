import { Controller, Get, Param } from '@nestjs/common';
import { PagamentosService } from '../services/pagamentos.service';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly service: PagamentosService) {}

  @Get('documento/:documentoId')
  findByDocumento(@Param('documentoId') documentoId: string) {
    return this.service.findByDocumento(documentoId);
  }
}
