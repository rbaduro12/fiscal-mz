import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'app_database.g.dart';

// ============================================================================
// TABLES - SQLite Local (mirror do PostgreSQL)
// ============================================================================

class Tenants extends Table {
  TextColumn get id => text()();
  TextColumn get nome => text()();
  TextColumn get nif => text()();
  TextColumn get email => text().nullable()();
  TextColumn get telefone => text().nullable()();
  RealColumn get walletBalance => real().withDefault(Constant(0))();
  TextColumn get configuracoesPagamento => text().nullable()();
  
  @override
  Set<Column> get primaryKey => {id};
}

class Clientes extends Table {
  TextColumn get id => text()();
  TextColumn get tenantId => text()();
  TextColumn get nome => text()();
  TextColumn get nif => text().nullable()();
  TextColumn get email => text().nullable()();
  TextColumn get telefone => text().nullable()();
  RealColumn get creditoAutorizado => real().withDefault(Constant(0))();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  BoolColumn get synced => boolean().withDefault(Constant(false))();
  
  @override
  Set<Column> get primaryKey => {id};
}

class Produtos extends Table {
  TextColumn get id => text()();
  TextColumn get tenantId => text()();
  TextColumn get codigo => text()();
  TextColumn get descricao => text()();
  RealColumn get precoUnitario => real()();
  RealColumn get ivaPercentual => real().withDefault(Constant(16))();
  RealColumn get stockDisponivel => real().withDefault(Constant(0))();
  BoolColumn get ativo => boolean().withDefault(Constant(true))();
  DateTimeColumn get updatedAt => dateTime()();
  BoolColumn get synced => boolean().withDefault(Constant(false))();
  
  @override
  Set<Column> get primaryKey => {id};
}

// ============================================================================
// WORKFLOW TABLES
// ============================================================================

class WorkflowNegociacoes extends Table {
  TextColumn get id => text()();
  TextColumn get tenantId => text()();
  TextColumn get clienteId => text()();
  TextColumn get status => text()(); // RASCUNHO, ENVIADA, NEGOCIANDO, ACEITE, etc
  TextColumn get itens => text()(); // JSON
  RealColumn get subtotal => real()();
  RealColumn get totalDescontos => real()();
  RealColumn get totalIva => real()();
  RealColumn get totalEstimado => real()();
  DateTimeColumn get validadeAte => dateTime()();
  TextColumn get historicoNegociacao => text().nullable()(); // JSON
  TextColumn get conversaoDocumentoId => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  BoolColumn get synced => boolean().withDefault(Constant(false))();
  BoolColumn get pendingDelete => boolean().withDefault(Constant(false))();
  
  @override
  Set<Column> get primaryKey => {id};
}

class Proformas extends Table {
  TextColumn get id => text()();
  TextColumn get cotacaoId => text().nullable()();
  TextColumn get tenantId => text()();
  TextColumn get clienteId => text()();
  TextColumn get numeroProforma => text()();
  IntColumn get anoProforma => integer()();
  DateTimeColumn get dataEmissao => dateTime()();
  DateTimeColumn get dataVencimento => dateTime()();
  TextColumn get itens => text()(); // JSON
  RealColumn get subtotal => real()();
  RealColumn get totalDescontos => real()();
  RealColumn get totalIva => real()();
  RealColumn get totalGeral => real()();
  TextColumn get condicoesPagamento => text()(); // IMMEDIATO, 30_DIAS, ESCROW
  TextColumn get status => text()(); // PENDENTE, EM_ESCROW, PAGA, VENCIDA
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  BoolColumn get synced => boolean().withDefault(Constant(false))();
  BoolColumn get pendingDelete => boolean().withDefault(Constant(false))();
  
  @override
  Set<Column> get primaryKey => {id};
}

// ============================================================================
// PAYMENT TABLES
// ============================================================================

class Pagamentos extends Table {
  TextColumn get id => text()();
  TextColumn get tenantId => text()();
  TextColumn get clienteId => text()();
  TextColumn get proformaId => text().nullable()();
  TextColumn get faturaId => text().nullable()();
  TextColumn get metodo => text()(); // CASH, MPESA, EMOLA, BIM, ESCROW
  RealColumn get valor => real()();
  TextColumn get moeda => text().withDefault(Constant('MZN'))();
  TextColumn get estado => text().withDefault(Constant('PENDENTE'))(); // PENDENTE, PROCESSANDO, CONCLUIDO, FALHADO
  TextColumn get gatewayRef => text().nullable()();
  BoolColumn get isEscrow => boolean().withDefault(Constant(false))();
  DateTimeColumn get escrowReleaseDate => dateTime().nullable()();
  TextColumn get comprovativoUrl => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get processedAt => dateTime().nullable()();
  BoolColumn get synced => boolean().withDefault(Constant(false))();
  
  @override
  Set<Column> get primaryKey => {id};
}

// ============================================================================
// FISCAL TABLES
// ============================================================================

class DocumentosFiscais extends Table {
  TextColumn get id => text()();
  TextColumn get tenantId => text()();
  TextColumn get clienteId => text()();
  TextColumn get proformaOriginId => text().nullable()();
  TextColumn get tipo => text()(); // FT, FR, NC, ND
  TextColumn get numeroDocumento => text()();
  IntColumn get anoFiscal => integer()();
  DateTimeColumn get dataEmissao => dateTime()();
  TextColumn get itens => text()(); // JSON
  RealColumn get subtotal => real()();
  RealColumn get totalDescontos => real()();
  RealColumn get totalIva => real()();
  RealColumn get totalGeral => real()();
  TextColumn get hashDocumento => text()();
  TextColumn get qrCodeData => text().nullable()();
  TextColumn get estadoPagamento => text().withDefault(Constant('PENDENTE'))();
  BoolColumn get pagamentoIntegrado => boolean().withDefault(Constant(false))();
  TextColumn get estado => text().withDefault(Constant('ATIVO'))();
  DateTimeColumn get createdAt => dateTime()();
  BoolColumn get synced => boolean().withDefault(Constant(false))();
  
  @override
  Set<Column> get primaryKey => {id};
}

class Recibos extends Table {
  TextColumn get id => text()();
  TextColumn get tenantId => text()();
  TextColumn get faturaId => text()();
  TextColumn get pagamentoId => text()();
  TextColumn get numeroRecibo => text()();
  IntColumn get anoRecibo => integer()();
  DateTimeColumn get dataRecibo => dateTime()();
  RealColumn get valorRecebido => real()();
  TextColumn get metodo => text()();
  TextColumn get hashRecibo => text()();
  DateTimeColumn get createdAt => dateTime()();
  BoolColumn get synced => boolean().withDefault(Constant(false))();
  
  @override
  Set<Column> get primaryKey => {id};
}

// ============================================================================
// SYNC QUEUE TABLE
// ============================================================================

class SyncQueue extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get entityType => text()(); // 'Quote', 'Proforma', 'Payment'
  TextColumn get entityId => text()();
  TextColumn get operation => text()(); // 'INSERT', 'UPDATE', 'DELETE'
  TextColumn get payload => text()(); // JSON
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  IntColumn get retryCount => integer().withDefault(Constant(0))();
  DateTimeColumn get lastRetry => dateTime().nullable()();
  TextColumn get error => text().nullable()();
  IntColumn get priority => integer().withDefault(Constant(0))(); // Higher = more priority
  BoolColumn get processing => boolean().withDefault(Constant(false))();
  
  @override
  Set<Column> get primaryKey => {id};
}

// ============================================================================
// DATABASE CLASS
// ============================================================================

@DriftDatabase(tables: [
  Tenants,
  Clientes,
  Produtos,
  WorkflowNegociacoes,
  Proformas,
  Pagamentos,
  DocumentosFiscais,
  Recibos,
  SyncQueue,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());
  
  AppDatabase.forTesting(DatabaseConnection connection) : super(connection);

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onCreate: (Migrator m) async {
      await m.createAll();
    },
    onUpgrade: (Migrator m, int from, int to) async {
      // Handle migrations here
    },
    beforeOpen: (details) async {
      await customStatement('PRAGMA foreign_keys = ON');
    },
  );

  // ==========================================================================
  // SYNC QUEUE OPERATIONS
  // ==========================================================================
  
  Future<void> addToQueue({
    required String entityType,
    required String entityId,
    required String operation,
    required Map<String, dynamic> payload,
    int priority = 0,
  }) async {
    await into(syncQueue).insert(
      SyncQueueCompanion(
        entityType: Value(entityType),
        entityId: Value(entityId),
        operation: Value(operation),
        payload: Value(payload.toString()),
        priority: Value(priority),
      ),
    );
  }

  Future<List<SyncQueueData>> getPendingOperations({int limit = 50}) async {
    return await (select(syncQueue)
      ..where((q) => q.processing.equals(false))
      ..orderBy([
        (q) => OrderingTerm(expression: q.priority, mode: OrderingMode.desc),
        (q) => OrderingTerm(expression: q.createdAt),
      ])
      ..limit(limit))
      .get();
  }

  Future<void> markAsProcessing(int id, bool processing) async {
    await update(syncQueue).replace(
      SyncQueueCompanion(
        id: Value(id),
        processing: Value(processing),
        lastRetry: Value(processing ? DateTime.now() : null),
      ),
    );
  }

  Future<void> incrementRetry(int id, String? errorMessage) async {
    final op = await (select(syncQueue)..where((q) => q.id.equals(id))).getSingle();
    await update(syncQueue).replace(
      SyncQueueCompanion(
        id: Value(id),
        retryCount: Value(op.retryCount + 1),
        error: Value(errorMessage),
        lastRetry: Value(DateTime.now()),
      ),
    );
  }

  Future<void> removeFromQueue(int id) async {
    await (delete(syncQueue)..where((q) => q.id.equals(id))).go();
  }

  Future<void> clearQueue() async {
    await delete(syncQueue).go();
  }

  Stream<int> watchPendingCount() {
    return (select(syncQueue)..where((q) => q.processing.equals(false)))
        .watch()
        .map((ops) => ops.length);
  }

  // ==========================================================================
  // UNSYNCED DATA QUERIES
  // ==========================================================================

  Future<List<WorkflowNegociacao>> getUnsyncedQuotes() async {
    return await (select(workflowNegociacoes)
      ..where((q) => q.synced.equals(false) | q.pendingDelete.equals(true)))
      .get();
  }

  Future<List<Proforma>> getUnsyncedProformas() async {
    return await (select(proformas)
      ..where((p) => p.synced.equals(false) | p.pendingDelete.equals(true)))
      .get();
  }

  Future<List<Pagamento>> getUnsyncedPayments() async {
    return await (select(pagamentos)..where((p) => p.synced.equals(false)))
        .get();
  }

  // ==========================================================================
  // MARK AS SYNCED
  // ==========================================================================

  Future<void> markQuoteAsSynced(String id) async {
    await update(workflowNegociacoes).replace(
      WorkflowNegociacoesCompanion(
        id: Value(id),
        synced: const Value(true),
        pendingDelete: const Value(false),
      ),
    );
  }

  Future<void> markProformaAsSynced(String id) async {
    await update(proformas).replace(
      ProformasCompanion(
        id: Value(id),
        synced: const Value(true),
        pendingDelete: const Value(false),
      ),
    );
  }

  // ==========================================================================
  // DASHBOARD QUERIES
  // ==========================================================================

  Future<List<Proforma>> getPendingProformas(String tenantId) async {
    return await (select(proformas)
      ..where((p) => p.tenantId.equals(tenantId) & p.status.equals('PENDENTE'))
      ..orderBy([(p) => OrderingTerm(expression: p.dataVencimento)]))
      .get();
  }

  Future<List<WorkflowNegociacao>> getQuotesByStatus(
    String tenantId,
    String status,
  ) async {
    return await (select(workflowNegociacoes)
      ..where((q) => q.tenantId.equals(tenantId) & q.status.equals(status))
      ..orderBy([(q) => OrderingTerm(expression: q.updatedAt, mode: OrderingMode.desc)]))
      .get();
  }

  Stream<List<WorkflowNegociacao>> watchRecentQuotes(String tenantId, {int limit = 20}) {
    return (select(workflowNegociacoes)
      ..where((q) => q.tenantId.equals(tenantId))
      ..orderBy([(q) => OrderingTerm(expression: q.updatedAt, mode: OrderingMode.desc)])
      ..limit(limit))
      .watch();
  }
}

// ============================================================================
// CONNECTION SETUP
// ============================================================================

DatabaseConnection _openConnection() {
  return driftDatabase(
    name: 'fiscal_mz_db',
    native: const DriftNativeOptions(
      databasePath: 'fiscal_mz',
    ),
  );
}
