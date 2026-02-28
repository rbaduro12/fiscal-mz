import { ICommand } from '@nestjs/cqrs';

export class EmitInvoiceCommand implements ICommand {
  constructor(
    public readonly proformaId: string,
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly isEscrowRelease?: boolean,
  ) {}
}
