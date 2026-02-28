import { IEvent } from '@nestjs/cqrs';

export class QuoteAcceptedEvent implements IEvent {
  constructor(
    public readonly quoteId: string,
    public readonly tenantId: string,
    public readonly clientId: string,
    public readonly totalEstimado: number,
  ) {}
}
