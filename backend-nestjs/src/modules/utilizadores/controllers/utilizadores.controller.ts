import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UtilizadoresService } from '../services/utilizadores.service';

@Controller('utilizadores')
export class UtilizadoresController {
  constructor(private readonly service: UtilizadoresService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
