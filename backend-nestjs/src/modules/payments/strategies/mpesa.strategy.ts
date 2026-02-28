import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IPaymentStrategy, PaymentResult, PaymentMetadata } from './payment-strategy.interface';

@Injectable()
export class MpesaStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(MpesaStrategy.name);
  readonly method = 'MPESA';

  constructor(private readonly configService: ConfigService) {}

  async processPayment(
    proformaId: string,
    amount: number,
    tenantId: string,
    clientId: string,
    metadata?: PaymentMetadata,
  ): Promise<PaymentResult> {
    try {
      const telefone = metadata?.telefone;
      if (!telefone) {
        return {
          success: false,
          status: 'FALHADO',
          message: 'Número de telefone obrigatório para M-Pesa',
        };
      }

      // Formatar telefone (remover +258 se existir)
      const numeroFormatado = telefone.replace(/^\+258/, '');

      // Chamar API M-Pesa (simulação - em produção usar SDK oficial)
      const mpesaApiUrl = this.configService.get('MPESA_API_URL');
      const mpesaApiKey = this.configService.get('MPESA_API_KEY');

      this.logger.log(`Iniciando pagamento M-Pesa: ${amount} MZN para ${numeroFormatado}`);

      // Simulação - em produção fazer chamada real
      // const response = await axios.post(mpesaApiUrl, {
      //   amount,
      //   phoneNumber: numeroFormatado,
      //   reference: proformaId,
      //   transactionDesc: `Proforma ${proformaId}`,
      // }, { headers: { Authorization: `Bearer ${mpesaApiKey}` }});

      // Mock response
      const gatewayReference = `MP${Date.now()}${Math.floor(Math.random() * 1000)}`;

      return {
        success: true,
        transactionId: gatewayReference,
        gatewayReference,
        status: 'PROCESSANDO',
        message: 'Aguardando confirmação do cliente no telemóvel',
        instructions: `Confirme a transação no seu telemóvel ${telefone}`,
      };
    } catch (error) {
      this.logger.error(`Erro M-Pesa: ${error.message}`);
      return {
        success: false,
        status: 'FALHADO',
        message: 'Erro ao processar pagamento M-Pesa',
      };
    }
  }

  async checkStatus(transactionId: string): Promise<PaymentResult> {
    // Verificar status na API M-Pesa
    this.logger.log(`Verificando status M-Pesa: ${transactionId}`);
    
    // Mock - em produção consultar API
    return {
      success: true,
      transactionId,
      status: 'PROCESSANDO',
      message: 'Pagamento em processamento',
    };
  }

  async handleWebhook(payload: any): Promise<PaymentResult> {
    this.logger.log(`Webhook M-Pesa recebido: ${JSON.stringify(payload)}`);

    // Validar HMAC se configurado
    const secret = this.configService.get('MPESA_WEBHOOK_SECRET');
    if (secret && !this.validateWebhook(payload, secret)) {
      throw new Error('Webhook inválido');
    }

    const { transactionId, status, amount } = payload;

    if (status === 'SUCCESS') {
      return {
        success: true,
        transactionId,
        status: 'CONCLUIDO',
        message: 'Pagamento confirmado',
      };
    }

    return {
      success: false,
      transactionId,
      status: 'FALHADO',
      message: payload.reason || 'Pagamento falhou',
    };
  }

  private validateWebhook(payload: any, secret: string): boolean {
    // Implementar validação HMAC
    return true;
  }
}
