import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CotacoesService } from '../services/cotacoes.service';
import { CreateQuoteCommand } from '../commands/impl/create-quote.command';
import { AcceptQuoteCommand } from '../commands/impl/accept-quote.command';
import { GenerateProformaCommand } from '../commands/impl/generate-proforma.command';
import { CreateQuoteHandler } from '../commands/handlers/create-quote.handler';
import { AcceptQuoteHandler } from '../commands/handlers/accept-quote.handler';
import { GenerateProformaHandler } from '../commands/handlers/generate-proforma.handler';
import { PaymentOrchestrator, PaymentRequest } from '../services/payment-orchestrator.service';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class CotacoesController {
  constructor(
    private cotacoesService: CotacoesService,
    private createQuoteHandler: CreateQuoteHandler,
    private acceptQuoteHandler: AcceptQuoteHandler,
    private generateProformaHandler: GenerateProformaHandler,
    private paymentOrchestrator: PaymentOrchestrator,
  ) {}

  // ==================== COTAÇÕES ====================

  @Post('quotes')
  @HttpCode(HttpStatus.CREATED)
  @RateLimit(10, 60) // 10 requests por minuto
  async createQuote(
    @Body() data: Omit<CreateQuoteCommand['data'], 'tenantId'>,
    @CurrentUser() user: any,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    const command = new CreateQuoteCommand(
      { ...data, tenantId: user.empresaId, idempotencyKey },
      user.id,
    );
    return this.createQuoteHandler.execute(command);
  }

  @Get('quotes/sent')
  async getSentQuotes(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.cotacoesService.findByVendedor(user.empresaId, page, limit);
  }

  @Get('quotes/received')
  async getReceivedQuotes(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.cotacoesService.findByCliente(user.empresaId, page, limit);
  }

  @Get('quotes/:id')
  async getQuote(@Param('id') id: string, @CurrentUser() user: any) {
    return this.cotacoesService.findOne(id, user.empresaId);
  }

  @Patch('quotes/:id/accept')
  async acceptQuote(
    @Param('id') id: string,
    @Body() data: AcceptQuoteCommand['data'],
    @CurrentUser() user: any,
  ) {
    const command = new AcceptQuoteCommand(id, data, user.empresaId);
    return this.acceptQuoteHandler.execute(command);
  }

  @Post('quotes/:id/proforma')
  async generateProforma(@Param('id') id: string, @CurrentUser() user: any) {
    const command = new GenerateProformaCommand(id, user.empresaId);
    return this.generateProformaHandler.execute(command);
  }

  // ==================== PAGAMENTOS ====================

  @Post('proformas/:id/pay')
  @RateLimit(10, 60)
  async payProforma(
    @Param('id') id: string,
    @Body() request: Omit<PaymentRequest, 'proformaId'>,
    @CurrentUser() user: any,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.paymentOrchestrator.processPayment({
      proformaId: id,
      ...request,
      idempotencyKey,
    });
  }

  @Post('payments/webhook/:gateway')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('gateway') gateway: string,
    @Body() payload: any,
    @Headers('x-signature') signature: string,
  ) {
    // Verificar assinatura HMAC
    // Processar webhook
    return { received: true };
  }

  // ==================== WALLET ====================

  @Get('wallet/balance')
  async getWalletBalance(@CurrentUser() user: any) {
    return this.cotacoesService.getWalletBalance(user.empresaId);
  }

  @Post('wallet/withdraw')
  async requestWithdrawal(
    @Body() data: { amount: number; bankAccount: string },
    @CurrentUser() user: any,
  ) {
    return this.cotacoesService.requestWithdrawal(user.empresaId, data);
  }
}
