import { v4 as uuidv4 } from 'uuid';

export interface InvoiceItem {
  produtoId: string;
  descricao: string;
  quantidade: number;
  precoUnit: number;
  descontoPercent: number;
  ivaPercent: number;
  totalLinha: number;
}

export interface InvoiceState {
  id: string;
  tenantId: string;
  clientId: string;
  proformaOriginId?: string;
  numeroDocumento: string;
  tipo: 'FT' | 'FR' | 'NC' | 'ND';
  dataEmissao: Date;
  itens: InvoiceItem[];
  subtotal: number;
  totalDescontos: number;
  totalIva: number;
  totalGeral: number;
  hash: string;
  estadoPagamento: 'PENDENTE' | 'PARCIAL' | 'PAGO' | 'EXCEDENTE';
  estado: 'ATIVO' | 'ANULADO';
  pagamentoId?: string;
  version: number;
}

export interface DomainEvent {
  type: string;
  payload: any;
  occurredOn: Date;
}

/**
 * Invoice Aggregate Root - Event Sourcing
 * Todas as mudanças de estado são registradas como eventos
 */
export class InvoiceAggregate {
  private state: Partial<InvoiceState> = { version: 0 };
  private uncommittedEvents: DomainEvent[] = [];

  get id(): string | undefined {
    return this.state.id;
  }

  get stateSnapshot(): InvoiceState {
    return this.state as InvoiceState;
  }

  get version(): number {
    return this.state.version || 0;
  }

  /**
   * Cria um novo aggregate aplicando eventos históricos
   */
  static createFromHistory(events: DomainEvent[]): InvoiceAggregate {
    const aggregate = new InvoiceAggregate();
    events.forEach(event => aggregate.applyEvent(event, false));
    return aggregate;
  }

  /**
   * Emite uma nova fatura fiscal
   */
  emitirFatura(
    tenantId: string,
    clientId: string,
    proformaOriginId: string | undefined,
    numeroDocumento: string,
    itens: InvoiceItem[],
    totais: { subtotal: number; totalDescontos: number; totalIva: number; totalGeral: number },
    hash: string,
    pagamentoId?: string,
  ): void {
    if (this.state.id) {
      throw new Error('Aggregate já existe');
    }

    const event: DomainEvent = {
      type: 'InvoiceEmittedEvent',
      payload: {
        id: uuidv4(),
        tenantId,
        clientId,
        proformaOriginId,
        numeroDocumento,
        tipo: 'FT',
        dataEmissao: new Date().toISOString(),
        itens,
        ...totais,
        hash,
        pagamentoId,
        estadoPagamento: pagamentoId ? 'PAGO' : 'PENDENTE',
        estado: 'ATIVO',
      },
      occurredOn: new Date(),
    };

    this.applyEvent(event, true);
  }

  /**
   * Anula uma fatura emitida
   */
  anularFatura(motivo: string, anuladoPor: string): void {
    if (this.state.estado === 'ANULADO') {
      throw new Error('Fatura já está anulada');
    }

    const event: DomainEvent = {
      type: 'InvoiceCancelledEvent',
      payload: {
        invoiceId: this.state.id,
        motivo,
        anuladoPor,
        anuladoEm: new Date().toISOString(),
      },
      occurredOn: new Date(),
    };

    this.applyEvent(event, true);
  }

  /**
   * Registra pagamento na fatura
   */
  registrarPagamento(pagamentoId: string, valor: number): void {
    const event: DomainEvent = {
      type: 'InvoicePaymentRegisteredEvent',
      payload: {
        invoiceId: this.state.id,
        pagamentoId,
        valor,
        dataPagamento: new Date().toISOString(),
      },
      occurredOn: new Date(),
    };

    this.applyEvent(event, true);
  }

  /**
   * Aplica um evento ao estado do aggregate
   */
  private applyEvent(event: DomainEvent, isNew: boolean): void {
    switch (event.type) {
      case 'InvoiceEmittedEvent':
        this.applyInvoiceEmitted(event.payload);
        break;
      case 'InvoiceCancelledEvent':
        this.applyInvoiceCancelled(event.payload);
        break;
      case 'InvoicePaymentRegisteredEvent':
        this.applyPaymentRegistered(event.payload);
        break;
      default:
        throw new Error(`Evento desconhecido: ${event.type}`);
    }

    this.state.version!++;

    if (isNew) {
      this.uncommittedEvents.push(event);
    }
  }

  private applyInvoiceEmitted(payload: any): void {
    this.state = {
      ...payload,
      dataEmissao: new Date(payload.dataEmissao),
      version: this.state.version,
    };
  }

  private applyInvoiceCancelled(payload: any): void {
    this.state.estado = 'ANULADO';
  }

  private applyPaymentRegistered(payload: any): void {
    // Lógica de atualização de estado de pagamento
    const totalPago = (this.state as any).totalPago || 0 + payload.valor;
    
    if (totalPago >= this.state.totalGeral!) {
      this.state.estadoPagamento = totalPago > this.state.totalGeral! ? 'EXCEDENTE' : 'PAGO';
    } else if (totalPago > 0) {
      this.state.estadoPagamento = 'PARCIAL';
    }
  }

  /**
   * Retorna eventos não persistidos
   */
  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  /**
   * Limpa eventos não persistidos após commit
   */
  markCommitted(): void {
    this.uncommittedEvents = [];
  }
}
