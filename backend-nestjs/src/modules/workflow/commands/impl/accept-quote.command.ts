import { ICommand } from '@nestjs/cqrs';

export class AcceptQuoteCommand implements ICommand {
  constructor(
    public readonly quoteId: string,
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly negotiatedItems?: Array<{
      produtoId: string;
      novoPreco?: number;
      novaQuantidade?: number;
      comentario?: string;
    }>,
  ) {}
}
