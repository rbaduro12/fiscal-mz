import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CreateQuoteCommand } from './commands/impl/create-quote.command';
import { AcceptQuoteCommand } from './commands/impl/accept-quote.command';
import { CreateQuoteDto, AcceptQuoteDto } from './dto/quote.dto';
import { GetPendingQuotesQuery } from './queries/impl/get-pending-quotes.query';
import { GetReceivedQuotesQuery } from './queries/impl/get-received-quotes.query';
import { GetQuoteByIdQuery } from './queries/impl/get-quote-by-id.query';

@ApiTags('Workflow')
@Controller('quotes')
@ApiBearerAuth()
export class WorkflowController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'Criar nova cotação' })
  @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'Chave para evitar duplicados' })
  @ApiResponse({ status: 201, description: 'Cotação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async createQuote(
    @Body() dto: CreateQuoteDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Headers('Idempotency-Key') idempotencyKey: string,
  ) {
    const result = await this.commandBus.execute(
      new CreateQuoteCommand(
        tenantId,
        dto.clientId,
        dto.items,
        dto.validityDays,
        userId,
      )
    );

    return {
      success: true,
      data: result,
      message: 'Cotação criada com sucesso',
    };
  }

  @Get('sent')
  @ApiOperation({ summary: 'Listar cotações enviadas (vendedor)' })
  @ApiResponse({ status: 200, description: 'Lista de cotações' })
  async getSentQuotes(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.queryBus.execute(
      new GetPendingQuotesQuery(tenantId, status, page, limit)
    );
  }

  @Get('received')
  @ApiOperation({ summary: 'Listar cotações recebidas (comprador)' })
  @ApiResponse({ status: 200, description: 'Lista de cotações' })
  async getReceivedQuotes(
    @Headers('x-client-id') clientId: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.queryBus.execute(
      new GetReceivedQuotesQuery(clientId, status, page, limit)
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma cotação' })
  @ApiResponse({ status: 200, description: 'Detalhes da cotação' })
  @ApiResponse({ status: 404, description: 'Cotação não encontrada' })
  async getQuoteById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.queryBus.execute(
      new GetQuoteByIdQuery(id, tenantId)
    );
  }

  @Patch(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aceitar cotação (gera proforma automaticamente)' })
  @ApiResponse({ status: 200, description: 'Cotação aceita e proforma gerada' })
  @ApiResponse({ status: 400, description: 'Cotação não pode ser aceita' })
  async acceptQuote(
    @Param('id') id: string,
    @Body() dto: AcceptQuoteDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    await this.commandBus.execute(
      new AcceptQuoteCommand(
        id,
        tenantId,
        userId,
        dto.negotiatedItems,
      )
    );

    return {
      success: true,
      message: 'Cotação aceita com sucesso',
    };
  }
}
