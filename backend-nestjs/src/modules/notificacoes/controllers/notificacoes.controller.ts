import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { NotificacoesService } from '../services/notificacoes.service';

@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly service: NotificacoesService) {}

  @Get()
  findByEmpresa(@Query('empresaId') empresaId: string) {
    return this.service.findByEmpresa(empresaId);
  }

  @Get('nao-lidas')
  findNaoLidas(@Query('empresaId') empresaId: string) {
    return this.service.findNaoLidas(empresaId);
  }

  @Post(':id/lida')
  marcarComoLida(@Param('id') id: string) {
    return this.service.marcarComoLida(id);
  }
}
