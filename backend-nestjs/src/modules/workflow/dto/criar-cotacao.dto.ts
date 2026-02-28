import { IsString, IsUUID, IsOptional, IsArray, IsNumber, Min, Max, IsDate, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemCotacaoDTO {
  @IsOptional()
  @IsUUID()
  artigoId?: string;

  @IsString()
  descricao: string;

  @IsNumber()
  @Min(0.001)
  quantidade: number;

  @IsNumber()
  @Min(0)
  precoUnitario: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxaIva?: number = 16;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  descontoPercentual?: number = 0;
}

export class CriarCotacaoDTO {
  @IsUUID()
  entidadeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemCotacaoDTO)
  itens: ItemCotacaoDTO[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dataValidade?: Date;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class AceitarCotacaoDTO {
  @IsUUID()
  empresaClienteId: string;
}

export class DadosPagamentoDTO {
  @IsString()
  metodo: string;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsUUID()
  utilizadorId: string;
}

export class RejeitarCotacaoDTO {
  @IsUUID()
  empresaClienteId: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}
