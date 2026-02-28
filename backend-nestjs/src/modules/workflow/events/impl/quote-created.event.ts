import { IEvent } from '@nestjs/cqrs';

export class QuoteCreatedEvent implements IEvent {
  constructor(
    public readonly quoteId: string,
    public readonly tenantId: string,
    public readonly clientId: string,
    public readonly numeroCotacao: string,
    public readonly totalEstimado: number,
  ) {}
}
