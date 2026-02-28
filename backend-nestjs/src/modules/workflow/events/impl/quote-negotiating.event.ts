import { IEvent } from '@nestjs/cqrs';

export class QuoteNegotiatingEvent implements IEvent {
  constructor(
    public readonly quoteId: string,
    public readonly tenantId: string,
    public readonly clientId: string,
  ) {}
}
