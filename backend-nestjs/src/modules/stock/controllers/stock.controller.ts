import { Controller, Get, Param } from '@nestjs/common';
import { StockService } from '../services/stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly service: StockService) {}

  @Get('movimentos/:artigoId')
  getMovimentos(@Param('artigoId') artigoId: string) {
    return this.service.getMovimentos(artigoId);
  }
}
