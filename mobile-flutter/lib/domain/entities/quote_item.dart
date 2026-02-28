import 'package:freezed_annotation/freezed_annotation.dart';

part 'quote_item.freezed.dart';
part 'quote_item.g.dart';

@freezed
class QuoteItem with _$QuoteItem {
  const factory QuoteItem({
    required String produtoId,
    required String descricao,
    required int quantidade,
    required double precoUnit,
    @Default(0) double descontoPercent,
    @Default(16) double ivaPercent,
    double? totalLinha,
  }) = _QuoteItem;

  factory QuoteItem.fromJson(Map<String, dynamic> json) =>
      _$QuoteItemFromJson(json);
}

extension QuoteItemCalculated on QuoteItem {
  double get calculatedTotal {
    final subtotal = quantidade * precoUnit;
    final desconto = subtotal * (descontoPercent / 100);
    final baseIva = subtotal - desconto;
    final iva = baseIva * (ivaPercent / 100);
    return baseIva + iva;
  }
}

@freezed
class Cliente with _$Cliente {
  const factory Cliente({
    required String id,
    required String nome,
    String? nif,
    String? email,
    String? telefone,
    String? endereco,
  }) = _Cliente;

  factory Cliente.fromJson(Map<String, dynamic> json) =>
      _$ClienteFromJson(json);
}
