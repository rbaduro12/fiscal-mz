import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../database/app_database.dart';
import '../sources/remote/api_client.dart';

final syncRepositoryProvider = Provider<SyncRepository>((ref) {
  return SyncRepository(
    database: ref.watch(appDatabaseProvider),
    apiClient: ref.watch(apiClientProvider),
    connectivity: Connectivity(),
  );
});

final appDatabaseProvider = Provider<AppDatabase>((ref) {
  return AppDatabase();
});

/// Repository responsável pela sincronização offline/online
class SyncRepository {
  final AppDatabase _database;
  final ApiClient _apiClient;
  final Connectivity _connectivity;
  
  StreamSubscription<ConnectivityResult>? _connectivitySubscription;
  Timer? _syncTimer;
  bool _isSyncing = false;
  DateTime? _lastSync;

  SyncRepository({
    required AppDatabase database,
    required ApiClient apiClient,
    required Connectivity connectivity,
  })  : _database = database,
        _apiClient = apiClient,
        _connectivity = connectivity;

  /// Inicializa listeners de conectividade
  void initialize() {
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
      (result) {
        if (result != ConnectivityResult.none) {
          // Tentar sync quando voltar online
          performSync();
        }
      },
    );
  }

  void dispose() {
    _connectivitySubscription?.cancel();
    _syncTimer?.cancel();
  }

  /// Verifica se está online
  Future<bool> get isOnline async {
    final result = await _connectivity.checkConnectivity();
    return result != ConnectivityResult.none;
  }

  /// Executa sync completo
  Future<SyncResult> performSync() async {
    if (_isSyncing) return SyncResult.alreadyRunning();
    
    final online = await isOnline;
    if (!online) return SyncResult.offline();

    _isSyncing = true;
    final results = SyncResult();

    try {
      // 1. PUSH: Enviar operações pendentes
      final pushResult = await _pushQueue();
      results.pushSucceeded = pushResult.succeeded;
      results.pushFailed = pushResult.failed;
      results.conflicts = pushResult.conflicts;

      // 2. PULL: Receber alterações do servidor
      final pullResult = await _pullDelta();
      results.pullSucceeded = pullResult.succeeded;
      results.pullFailed = pullResult.failed;

      _lastSync = DateTime.now();
      results.lastSync = _lastSync;
      results.success = results.pushFailed == 0 && results.pullFailed == 0;

    } catch (e) {
      results.success = false;
      results.error = e.toString();
    } finally {
      _isSyncing = false;
    }

    return results;
  }

  /// PUSH: Enviar operações pendentes para o servidor
  Future<_PushResult> _pushQueue() async {
    final result = _PushResult();
    final operations = await _database.getPendingOperations(limit: 50);

    for (final op in operations) {
      try {
        // Marcar como processando
        await _database.markAsProcessing(op.id, true);

        switch (op.entityType) {
          case 'Quote':
            await _pushQuote(op);
            break;
          case 'Proforma':
            await _pushProforma(op);
            break;
          case 'Payment':
            await _pushPayment(op);
            break;
          default:
            throw Exception('Unknown entity type: ${op.entityType}');
        }

        // Remover da fila após sucesso
        await _database.removeFromQueue(op.id);
        result.succeeded++;

      } on DioException catch (e) {
        // Erro de conexão - manter na fila para retry
        if (e.type == DioExceptionType.connectionError ||
            e.type == DioExceptionType.connectionTimeout) {
          await _database.markAsProcessing(op.id, false);
          break; // Parar de tentar outros
        }

        // Erro 4xx - problema com os dados
        if (e.response?.statusCode != null && 
            e.response!.statusCode! >= 400 && 
            e.response!.statusCode! < 500) {
          await _database.incrementRetry(op.id, e.response?.data?.toString());
          result.failed++;
        }
        // Erro 5xx - retry mais tarde
        else {
          await _database.incrementRetry(op.id, e.message);
          result.failed++;
        }

      } catch (e) {
        await _database.incrementRetry(op.id, e.toString());
        result.failed++;
      }
    }

    return result;
  }

  Future<void> _pushQuote(SyncQueueData op) async {
    final payload = jsonDecode(op.payload) as Map<String, dynamic>;
    
    switch (op.operation) {
      case 'INSERT':
        await _apiClient.createQuote(payload);
        break;
      case 'UPDATE':
        await _apiClient.updateQuote(op.entityId, payload);
        break;
      case 'DELETE':
        await _apiClient.deleteQuote(op.entityId);
        break;
    }
  }

  Future<void> _pushProforma(SyncQueueData op) async {
    // Proformas são geradas no servidor via trigger
    // Mas podemos ter updates de status
    final payload = jsonDecode(op.payload) as Map<String, dynamic>;
    
    if (op.operation == 'UPDATE') {
      await _apiClient.updateProforma(op.entityId, payload);
    }
  }

  Future<void> _pushPayment(SyncQueueData op) async {
    final payload = jsonDecode(op.payload) as Map<String, dynamic>;
    
    if (op.operation == 'INSERT') {
      await _apiClient.createPayment(payload);
    }
  }

  /// PULL: Receber alterações do servidor desde o último sync
  Future<_PullResult> _pullDelta() async {
    final result = _PullResult();
    
    try {
      final lastSyncTimestamp = _lastSync?.toIso8601String();
      
      // Pull quotes
      final quotesResponse = await _apiClient.getQuotesDelta(
        since: lastSyncTimestamp,
      );
      for (final quote in quotesResponse) {
        await _upsertQuote(quote);
      }
      result.succeeded += quotesResponse.length;

      // Pull proformas
      final proformasResponse = await _apiClient.getProformasDelta(
        since: lastSyncTimestamp,
      );
      for (final proforma in proformasResponse) {
        await _upsertProforma(proforma);
      }
      result.succeeded += proformasResponse.length;

      // Pull payments
      final paymentsResponse = await _apiClient.getPaymentsDelta(
        since: lastSyncTimestamp,
      );
      for (final payment in paymentsResponse) {
        await _upsertPayment(payment);
      }
      result.succeeded += paymentsResponse.length;

    } catch (e) {
      result.failed++;
      rethrow;
    }

    return result;
  }

  Future<void> _upsertQuote(Map<String, dynamic> data) async {
    final existing = await (_database.select(_database.workflowNegociacoes)
      ..where((q) => q.id.equals(data['id'])))
      .getSingleOrNull();

    if (existing == null || existing.updatedAt.isBefore(DateTime.parse(data['updated_at']))) {
      await _database.into(_database.workflowNegociacoes).insertOnConflictUpdate(
        WorkflowNegociacoesCompanion(
          id: Value(data['id']),
          tenantId: Value(data['tenant_id']),
          clienteId: Value(data['cliente_id']),
          status: Value(data['status']),
          itens: Value(jsonEncode(data['itens'])),
          subtotal: Value(data['subtotal']?.toDouble() ?? 0),
          totalDescontos: Value(data['total_descontos']?.toDouble() ?? 0),
          totalIva: Value(data['total_iva']?.toDouble() ?? 0),
          totalEstimado: Value(data['total_estimado']?.toDouble() ?? 0),
          validadeAte: Value(DateTime.parse(data['validade_ate'])),
          historicoNegociacao: Value(jsonEncode(data['historico_negociacao'])),
          conversaoDocumentoId: Value(data['conversao_documento_id']),
          createdAt: Value(DateTime.parse(data['created_at'])),
          updatedAt: Value(DateTime.parse(data['updated_at'])),
          synced: const Value(true),
        ),
      );
    }
  }

  Future<void> _upsertProforma(Map<String, dynamic> data) async {
    await _database.into(_database.proformas).insertOnConflictUpdate(
      ProformasCompanion(
        id: Value(data['id']),
        cotacaoId: Value(data['cotacao_id']),
        tenantId: Value(data['tenant_id']),
        clienteId: Value(data['cliente_id']),
        numeroProforma: Value(data['numero_proforma']),
        anoProforma: Value(data['ano_proforma']),
        dataEmissao: Value(DateTime.parse(data['data_emissao'])),
        dataVencimento: Value(DateTime.parse(data['data_vencimento'])),
        itens: Value(jsonEncode(data['itens'])),
        subtotal: Value(data['subtotal']?.toDouble() ?? 0),
        totalDescontos: Value(data['total_descontos']?.toDouble() ?? 0),
        totalIva: Value(data['total_iva']?.toDouble() ?? 0),
        totalGeral: Value(data['total_geral']?.toDouble() ?? 0),
        condicoesPagamento: Value(data['condicoes_pagamento']),
        status: Value(data['status']),
        createdAt: Value(DateTime.parse(data['created_at'])),
        updatedAt: Value(DateTime.parse(data['updated_at'])),
        synced: const Value(true),
      ),
    );
  }

  Future<void> _upsertPayment(Map<String, dynamic> data) async {
    await _database.into(_database.pagamentos).insertOnConflictUpdate(
      PagamentosCompanion(
        id: Value(data['id']),
        tenantId: Value(data['tenant_id']),
        clienteId: Value(data['cliente_id']),
        proformaId: Value(data['proforma_id']),
        faturaId: Value(data['fatura_id']),
        metodo: Value(data['metodo']),
        valor: Value(data['valor']?.toDouble() ?? 0),
        moeda: Value(data['moeda'] ?? 'MZN'),
        estado: Value(data['estado']),
        gatewayRef: Value(data['gateway_ref']),
        isEscrow: Value(data['is_escrow'] ?? false),
        createdAt: Value(DateTime.parse(data['created_at'])),
        processedAt: Value(data['processed_at'] != null 
            ? DateTime.parse(data['processed_at']) 
            : null),
        synced: const Value(true),
      ),
    );
  }

  /// Agenda sync periódico em background
  void startPeriodicSync({Duration interval = const Duration(minutes: 15)}) {
    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(interval, (_) async {
      final pendingCount = await (_database.select(_database.syncQueue)
        ..where((q) => q.processing.equals(false)))
        .get()
        .then((ops) => ops.length);
      
      if (pendingCount > 0) {
        await performSync();
      }
    });
  }

  /// Stream de progresso de sync
  Stream<SyncProgress> get syncProgressStream async* {
    // Implementar se necessário enviar progresso detalhado para UI
  }

  /// Resolve conflito (Server Wins para fiscais, User Wins para rascunhos)
  Future<void> resolveConflict({
    required String entityType,
    required String entityId,
    required ConflictResolution resolution,
  }) async {
    switch (resolution) {
      case ConflictResolution.useServer:
        // Pull do servidor e sobrescreve local
        break;
      case ConflictResolution.useLocal:
        // Mantém local e marca para re-sync
        await _database.addToQueue(
          entityType: entityType,
          entityId: entityId,
          operation: 'UPDATE',
          payload: {}, // Carregar dados locais
          priority: 10, // Alta prioridade
        );
        break;
      case ConflictResolution.merge:
        // Implementar merge manual se necessário
        break;
    }
  }
}

// ============================================================================
// DATA CLASSES
// ============================================================================

class SyncResult {
  bool success = false;
  int pushSucceeded = 0;
  int pushFailed = 0;
  int pullSucceeded = 0;
  int pullFailed = 0;
  int conflicts = 0;
  String? error;
  DateTime? lastSync;

  SyncResult();
  SyncResult.offline() : success = false;
  SyncResult.alreadyRunning() : success = false;

  bool get hasErrors => pushFailed > 0 || pullFailed > 0 || error != null;
}

class SyncProgress {
  final String operation;
  final int current;
  final int total;
  final String? entityId;

  SyncProgress({
    required this.operation,
    required this.current,
    required this.total,
    this.entityId,
  });

  double get percentage => total > 0 ? current / total : 0;
}

enum ConflictResolution { useServer, useLocal, merge }

class _PushResult {
  int succeeded = 0;
  int failed = 0;
  int conflicts = 0;
}

class _PullResult {
  int succeeded = 0;
  int failed = 0;
}
