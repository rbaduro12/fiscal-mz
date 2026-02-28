import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/database/app_database.dart';
import '../../domain/entities/quote_item.dart';

// Provider para acesso ao banco de dados
final appDatabaseProvider = Provider<AppDatabase>((ref) {
  return AppDatabase();
});

// Provider para SyncRepository
final syncRepositoryProvider = Provider<SyncRepository>((ref) {
  return SyncRepository(
    database: ref.watch(appDatabaseProvider),
    apiClient: ref.watch(apiClientProvider),
    connectivity: Connectivity(),
  );
});

// Provider para API Client
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

// Provider para busca de clientes
final clientesSearchProvider = StreamProvider.family<List<Cliente>, String>((ref, query) async* {
  final database = ref.watch(appDatabaseProvider);
  
  // Buscar do banco local
  final clientes = await (database.select(database.clientes)
    ..where((c) => c.nome.contains(query) | c.nif.contains(query))
    ..limit(20))
    .get();
  
  yield clientes.map((c) => Cliente(
    id: c.id,
    nome: c.nome,
    nif: c.nif,
    email: c.email,
    telefone: c.telefone,
  )).toList();
});

// Provider para lista de cotações
final quotesListProvider = StreamProvider.family<List<QuoteSummary>, String>((ref, status) async* {
  final database = ref.watch(appDatabaseProvider);
  
  yield* (database.select(database.workflowNegociacoes)
    ..where((q) => q.status.equals(status))
    ..orderBy([(q) => OrderingTerm(expression: q.updatedAt, mode: OrderingMode.desc)]))
    .watch()
    .map((quotes) => quotes.map((q) => QuoteSummary(
      id: q.id,
      numeroCotacao: 'C/2024/001', // TODO: calcular número real
      clienteNome: 'Cliente', // TODO: buscar nome do cliente
      totalEstimado: q.totalEstimado,
      status: q.status,
      updatedAt: q.updatedAt,
    )).toList());
});

// Provider para contagem de operações pendentes
final pendingOperationsCountProvider = StreamProvider<int>((ref) async* {
  final database = ref.watch(appDatabaseProvider);
  yield* database.watchPendingCount();
});

// Notifier para estado de criação de cotação
class QuoteCreationNotifier extends StateNotifier<QuoteCreationState> {
  QuoteCreationNotifier() : super(QuoteCreationState());

  void setCliente(Cliente cliente) {
    state = state.copyWith(cliente: cliente);
  }

  void addItem(QuoteItem item) {
    state = state.copyWith(items: [...state.items, item]);
  }

  void removeItem(int index) {
    final items = [...state.items];
    items.removeAt(index);
    state = state.copyWith(items: items);
  }

  void setValidityDays(int days) {
    state = state.copyWith(validityDays: days);
  }

  void reset() {
    state = QuoteCreationState();
  }

  double get total {
    return state.items.fold(0, (sum, item) => sum + item.calculatedTotal);
  }
}

final quoteCreationProvider = StateNotifierProvider<QuoteCreationNotifier, QuoteCreationState>((ref) {
  return QuoteCreationNotifier();
});

// ============================================================================
// STATE CLASSES
// ============================================================================

class QuoteCreationState {
  final Cliente? cliente;
  final List<QuoteItem> items;
  final int validityDays;

  QuoteCreationState({
    this.cliente,
    this.items = const [],
    this.validityDays = 30,
  });

  QuoteCreationState copyWith({
    Cliente? cliente,
    List<QuoteItem>? items,
    int? validityDays,
  }) {
    return QuoteCreationState(
      cliente: cliente ?? this.cliente,
      items: items ?? this.items,
      validityDays: validityDays ?? this.validityDays,
    );
  }
}

class QuoteSummary {
  final String id;
  final String numeroCotacao;
  final String clienteNome;
  final double totalEstimado;
  final String status;
  final DateTime updatedAt;

  QuoteSummary({
    required this.id,
    required this.numeroCotacao,
    required this.clienteNome,
    required this.totalEstimado,
    required this.status,
    required this.updatedAt,
  });
}

// ============================================================================
// STUBS (para compilar)
// ============================================================================

class SyncRepository {
  final AppDatabase database;
  final ApiClient apiClient;
  final dynamic connectivity;

  SyncRepository({
    required this.database,
    required this.apiClient,
    required this.connectivity,
  });

  Future<bool> get isOnline async => true;
  
  Future<dynamic> performSync() async => null;
}

class ApiClient {
  Future<void> createQuote(Map<String, dynamic> payload) async {}
  Future<void> updateQuote(String id, Map<String, dynamic> payload) async {}
  Future<void> deleteQuote(String id) async {}
  Future<void> updateProforma(String id, Map<String, dynamic> payload) async {}
  Future<void> createPayment(Map<String, dynamic> payload) async {}
  Future<List<dynamic>> getQuotesDelta({String? since}) async => [];
  Future<List<dynamic>> getProformasDelta({String? since}) async => [];
  Future<List<dynamic>> getPaymentsDelta({String? since}) async => [];
}

class Connectivity {
  Future<dynamic> checkConnectivity() async => null;
  Stream<dynamic> get onConnectivityChanged => Stream.empty();
}
