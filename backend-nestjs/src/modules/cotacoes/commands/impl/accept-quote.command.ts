export interface AcceptQuoteDto {
  negotiatedPrice?: number;
  observacoes?: string;
}

export class AcceptQuoteCommand {
  constructor(
    public readonly cotacaoId: string,
    public readonly data: AcceptQuoteDto,
    public readonly clienteId: string,
  ) {}
}
