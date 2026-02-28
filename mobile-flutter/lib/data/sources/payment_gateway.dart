import 'dart:async';
import 'dart:io';
import 'package:url_launcher/url_launcher.dart';
import 'package:app_links/app_links.dart';

/// Gateway de pagamento abstrato
abstract class PaymentGateway {
  Future<PaymentResult> initiatePayment({
    required String phoneNumber,
    required double amount,
    required String reference,
    String? description,
  });
  
  Future<PaymentResult> checkStatus(String transactionId);
  
  Stream<PaymentStatus> get statusStream;
}

/// Implementação M-Pesa usando deep links e USSD
class MpesaGateway implements PaymentGateway {
  final _appLinks = AppLinks();
  final _statusController = StreamController<PaymentStatus>.broadcast();
  StreamSubscription<Uri>? _linkSubscription;

  MpesaGateway() {
    _initDeepLinks();
  }

  void _initDeepLinks() {
    _linkSubscription = _appLinks.uriLinkStream.listen((uri) {
      _handleDeepLink(uri);
    });
  }

  void _handleDeepLink(Uri uri) {
    // Handle retorno do pagamento
    // Ex: fiscal://payment/callback?status=success&ref=123&transaction=MP456
    if (uri.scheme == 'fiscal' && uri.host == 'payment') {
      final status = uri.queryParameters['status'];
      final transactionId = uri.queryParameters['transaction'];
      
      if (status == 'success') {
        _statusController.add(PaymentStatus.success(transactionId!));
      } else if (status == 'failed') {
        _statusController.add(PaymentStatus.failed(
          transactionId ?? '',
          uri.queryParameters['reason'] ?? 'Pagamento falhou',
        ));
      }
    }
  }

  @override
  Future<PaymentResult> initiatePayment({
    required String phoneNumber,
    required double amount,
    required String reference,
    String? description,
  }) async {
    try {
      // Formatar telefone
      final formattedPhone = _formatPhoneNumber(phoneNumber);
      
      // Opção 1: Tentar abrir app M-Pesa diretamente (se disponível)
      final mpesaUri = Uri.parse(
        'mpesa://payment?amount=$amount&phone=$formattedPhone&ref=$reference',
      );
      
      if (await canLaunchUrl(mpesaUri)) {
        await launchUrl(
          mpesaUri,
          mode: LaunchMode.externalApplication,
        );
        
        return PaymentResult.pending(
          transactionId: 'MP-${DateTime.now().millisecondsSinceEpoch}',
          message: 'Aguardando confirmação no M-Pesa',
        );
      }
      
      // Opção 2: USSD fallback
      final ussdCode = _generateUssdCode(formattedPhone, amount, reference);
      final ussdUri = Uri.parse('tel:$ussdCode');
      
      if (await canLaunchUrl(ussdUri)) {
        await launchUrl(ussdUri);
        
        return PaymentResult.pending(
          transactionId: 'USSD-${DateTime.now().millisecondsSinceEpoch}',
          message: 'Complete o pagamento via USSD',
        );
      }
      
      return PaymentResult.error('Não foi possível iniciar o pagamento M-Pesa');
      
    } catch (e) {
      return PaymentResult.error('Erro: $e');
    }
  }

  /// Gera código USSD para pagamento M-Pesa
  /// Formato: *150# ou *150*1*1*NUMBER*AMOUNT*PIN#
  String _generateUssdCode(String phone, double amount, String reference) {
    // Exemplo simplificado - ajustar conforme implementação real da M-Pesa
    final amountInt = amount.toInt();
    return '*150*1*1*$phone*$amountInt#';
  }

  String _formatPhoneNumber(String phone) {
    // Remove tudo exceto números
    var digits = phone.replaceAll(RegExp(r'[^0-9]'), '');
    
    // Remove prefixo +258 ou 258 se existir
    if (digits.startsWith('258')) {
      digits = digits.substring(3);
    }
    
    return digits;
  }

  @override
  Future<PaymentResult> checkStatus(String transactionId) async {
    // Implementar verificação via API
    return PaymentResult.pending(
      transactionId: transactionId,
      message: 'Verificando status...',
    );
  }

  @override
  Stream<PaymentStatus> get statusStream => _statusController.stream;

  void dispose() {
    _linkSubscription?.cancel();
    _statusController.close();
  }
}

/// Pagamento em dinheiro - confirmação manual
class CashGateway implements PaymentGateway {
  final _statusController = StreamController<PaymentStatus>.broadcast();

  @override
  Future<PaymentResult> initiatePayment({
    required String phoneNumber,
    required double amount,
    required String reference,
    String? description,
  }) async {
    // Cash não inicia pagamento, apenas marca como pendente
    return PaymentResult.pending(
      transactionId: 'CASH-${DateTime.now().millisecondsSinceEpoch}',
      message: 'Aguardando confirmação do vendedor',
    );
  }

  @override
  Future<PaymentResult> checkStatus(String transactionId) async {
    return PaymentResult.pending(
      transactionId: transactionId,
      message: 'Aguardando confirmação manual',
    );
  }

  /// Confirmar recebimento de dinheiro (chamado pelo vendedor)
  Future<void> confirmReceipt(String transactionId) async {
    _statusController.add(PaymentStatus.success(transactionId));
  }

  @override
  Stream<PaymentStatus> get statusStream => _statusController.stream;

  void dispose() {
    _statusController.close();
  }
}

/// Pagamento Escrow (garantia)
class EscrowGateway implements PaymentGateway {
  final _statusController = StreamController<PaymentStatus>.broadcast();

  @override
  Future<PaymentResult> initiatePayment({
    required String phoneNumber,
    required double amount,
    required String reference,
    String? description,
  }) async {
    // Escrow inicia pagamento retido
    return PaymentResult.pending(
      transactionId: 'ESCROW-${DateTime.now().millisecondsSinceEpoch}',
      message: 'Pagamento em garantia iniciado',
    );
  }

  @override
  Future<PaymentResult> checkStatus(String transactionId) async {
    return PaymentResult.pending(
      transactionId: transactionId,
      message: 'Em garantia - aguardando confirmação de entrega',
    );
  }

  /// Liberar fundos para o vendedor
  Future<void> releaseFunds(String transactionId) async {
    _statusController.add(PaymentStatus.success(transactionId));
  }

  @override
  Stream<PaymentStatus> get statusStream => _statusController.stream;

  void dispose() {
    _statusController.close();
  }
}

// ============================================================================
// DATA CLASSES
// ============================================================================

class PaymentResult {
  final PaymentResultStatus status;
  final String transactionId;
  final String? message;
  final String? error;

  PaymentResult._({
    required this.status,
    required this.transactionId,
    this.message,
    this.error,
  });

  factory PaymentResult.pending({
    required String transactionId,
    String? message,
  }) => PaymentResult._(
    status: PaymentResultStatus.pending,
    transactionId: transactionId,
    message: message,
  );

  factory PaymentResult.success({
    required String transactionId,
    String? message,
  }) => PaymentResult._(
    status: PaymentResultStatus.success,
    transactionId: transactionId,
    message: message,
  );

  factory PaymentResult.failed({
    required String transactionId,
    required String error,
  }) => PaymentResult._(
    status: PaymentResultStatus.failed,
    transactionId: transactionId,
    error: error,
  );

  factory PaymentResult.error(String error) => PaymentResult._(
    status: PaymentResultStatus.error,
    transactionId: '',
    error: error,
  );

  bool get isPending => status == PaymentResultStatus.pending;
  bool get isSuccess => status == PaymentResultStatus.success;
  bool get isFailed => status == PaymentResultStatus.failed;
}

enum PaymentResultStatus { pending, success, failed, error }

class PaymentStatus {
  final String status; // 'pending', 'success', 'failed'
  final String transactionId;
  final String? message;

  PaymentStatus._(this.status, this.transactionId, this.message);

  factory PaymentStatus.pending(String transactionId) => 
      PaymentStatus._('pending', transactionId, null);
  
  factory PaymentStatus.success(String transactionId) => 
      PaymentStatus._('success', transactionId, 'Pagamento confirmado');
  
  factory PaymentStatus.failed(String transactionId, String reason) => 
      PaymentStatus._('failed', transactionId, reason);
}
