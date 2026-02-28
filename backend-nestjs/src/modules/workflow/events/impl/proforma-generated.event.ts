import { IEvent } from '@nestjs/cqrs';

export class ProformaGeneratedEvent implements IEvent {
  constructor(
    public readonly proformaId: string,
    public readonly tenantId: string,
    public readonly clientId: string,
    public readonly numeroProforma: string,
    public readonly totalGeral: number,
  ) {}
}
