import 'package:intl/intl.dart';

/// Formatadores de dados
class Formatters {
  Formatters._();

  /// Formata valor monetário
  static String currency(double value, {String symbol = 'MZN'}) {
    return NumberFormat.currency(
      locale: 'pt_MZ',
      symbol: '',
      decimalDigits: 2,
    ).format(value).trim() + ' $symbol';
  }

  /// Formata data
  static String date(DateTime date) {
    return DateFormat('dd/MM/yyyy', 'pt_MZ').format(date);
  }

  /// Formata data e hora
  static String dateTime(DateTime date) {
    return DateFormat('dd/MM/yyyy HH:mm', 'pt_MZ').format(date);
  }

  /// Formata telefone
  static String phone(String phone) {
    final digits = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.length == 9) {
      return '${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}';
    }
    return phone;
  }

  /// Formata NUIT
  static String nuit(String nuit) {
    if (nuit.length == 9) {
      return '${nuit.substring(0, 3)} ${nuit.substring(3, 6)} ${nuit.substring(6)}';
    }
    return nuit;
  }

  /// Formata número de documento
  static String documentNumber(String number) {
    return number.toUpperCase();
  }
}
