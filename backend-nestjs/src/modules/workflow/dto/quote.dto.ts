import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class QuoteItemDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsUUID()
  produtoId: string;

  @ApiProperty({ description: 'Descrição do item' })
  @IsString()
  descricao: string;

  @ApiProperty({ description: 'Quantidade', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantidade: number;

  @ApiProperty({ description: 'Preço unitário', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  precoUnit: number;

  @ApiPropertyOptional({ description: 'Percentual de desconto', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descontoPercent?: number;

  @ApiPropertyOptional({ description: 'Percentual de IVA', default: 16 })
  @IsOptional()
  @IsNumber()
  ivaPercent?: number;
}

export class CreateQuoteDto {
  @ApiProperty({ description: 'ID do cliente' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'Itens da cotação', type: [QuoteItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items: QuoteItemDto[];

  @ApiPropertyOptional({ description: 'Dias de validade', default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  validityDays?: number;
}

class NegotiatedItemDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsUUID()
  produtoId: string;

  @ApiPropertyOptional({ description: 'Novo preço negociado' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  novoPreco?: number;

  @ApiPropertyOptional({ description: 'Nova quantidade' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  novaQuantidade?: number;

  @ApiPropertyOptional({ description: 'Comentário da negociação' })
  @IsOptional()
  @IsString()
  comentario?: string;
}

export class AcceptQuoteDto {
  @ApiPropertyOptional({
    description: 'Itens com contra-proposta (se houver)',
    type: [NegotiatedItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NegotiatedItemDto)
  negotiatedItems?: NegotiatedItemDto[];
}
