export interface CreateQuoteDto {
  tenantId: string;
  clienteId: string;
  itens: Array<{
    artigoId: string;
    codigo: string;
    descricao: string;
    quantidade: number;
    precoUnitario: number;
    desconto?: number;
    taxaIva?: number;
  }>;
  validadeDias?: number;
  observacoes?: string;
  idempotencyKey?: string;
}

export class CreateQuoteCommand {
  constructor(
    public readonly data: CreateQuoteDto,
    public readonly vendedorId: string,
  ) {}
}
