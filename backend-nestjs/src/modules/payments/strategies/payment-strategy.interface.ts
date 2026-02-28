export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  gatewayReference?: string;
  status: 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO' | 'FALHADO';
  message?: string;
  instructions?: string;
}

export interface PaymentMetadata {
  telefone?: string;
  cardToken?: string;
  comprovativoUrl?: string;
  [key: string]: any;
}

export interface IPaymentStrategy {
  readonly method: string;
  processPayment(
    proformaId: string,
    amount: number,
    tenantId: string,
    clientId: string,
    metadata?: PaymentMetadata,
  ): Promise<PaymentResult>;
  checkStatus(transactionId: string): Promise<PaymentResult>;
  handleWebhook(payload: any): Promise<PaymentResult>;
}
