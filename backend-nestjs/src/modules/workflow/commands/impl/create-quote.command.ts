import { ICommand } from '@nestjs/cqrs';

export interface CreateQuoteItemDto {
  produtoId: string;
  descricao: string;
  quantidade: number;
  precoUnit: number;
  descontoPercent?: number;
  ivaPercent?: number;
}

export class CreateQuoteCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly clientId: string,
    public readonly items: CreateQuoteItemDto[],
    public readonly validityDays: number = 30,
    public readonly createdBy?: string,
  ) {}
}
