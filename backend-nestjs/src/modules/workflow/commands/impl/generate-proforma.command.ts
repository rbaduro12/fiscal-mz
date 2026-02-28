import { ICommand } from '@nestjs/cqrs';

export class GenerateProformaCommand implements ICommand {
  constructor(
    public readonly quoteId: string,
    public readonly tenantId: string,
    public readonly condicoesPagamento?: 'IMMEDIATO' | '30_DIAS' | '50_50' | 'ESCROW',
  ) {}
}
