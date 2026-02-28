import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/database/app_database.dart';
import '../../../domain/entities/quote_item.dart';
import '../../providers/quote_providers.dart';
import '../../widgets/fiscal_card.dart';
import '../../widgets/status_badge.dart';

/// Wizard de 3 passos para criar cotação
/// Passo 1: Selecionar Cliente
/// Passo 2: Adicionar Itens (com scanner de produtos)
/// Passo 3: Revisão e Envio
class CreateQuoteScreen extends ConsumerStatefulWidget {
  const CreateQuoteScreen({super.key});

  @override
  ConsumerState<CreateQuoteScreen> createState() => _CreateQuoteScreenState();
}

class _CreateQuoteScreenState extends ConsumerState<CreateQuoteScreen> {
  int _currentStep = 0;
  
  // Step 1: Cliente
  Cliente? _selectedCliente;
  final _searchController = TextEditingController();
  
  // Step 2: Itens
  final List<QuoteItem> _items = [];
  final _descricaoController = TextEditingController();
  final _quantidadeController = TextEditingController(text: '1');
  final _precoController = TextEditingController();
  final _descontoController = TextEditingController(text: '0');
  
  // Step 3: Configurações
  int _validityDays = 30;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _searchController.dispose();
    _descricaoController.dispose();
    _quantidadeController.dispose();
    _precoController.dispose();
    _descontoController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < 2) {
      setState(() => _currentStep++);
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  Future<void> _submitQuote() async {
    if (_selectedCliente == null || _items.isEmpty) return;

    setState(() => _isSubmitting = true);

    try {
      final database = ref.read(appDatabaseProvider);
      final quoteId = const Uuid().v4();
      
      // Calcular totais
      final totals = _calculateTotals();
      
      // Inserir cotação local
      await database.into(database.workflowNegociacoes).insert(
        WorkflowNegociacoesCompanion(
          id: Value(quoteId),
          tenantId: const Value('tenant-1'), // TODO: Pegar do auth
          clienteId: Value(_selectedCliente!.id),
          status: const Value('RASCUNHO'),
          itens: Value(jsonEncode(_items.map((i) => i.toJson()).toList())),
          subtotal: Value(totals['subtotal']!),
          totalDescontos: Value(totals['totalDescontos']!),
          totalIva: Value(totals['totalIva']!),
          totalEstimado: Value(totals['totalGeral']!),
          validadeAte: Value(DateTime.now().add(Duration(days: _validityDays))),
          historicoNegociacao: Value(jsonEncode([])),
          createdAt: Value(DateTime.now()),
          updatedAt: Value(DateTime.now()),
          synced: const Value(false),
        ),
      );

      // Adicionar à fila de sync
      await database.addToQueue(
        entityType: 'Quote',
        entityId: quoteId,
        operation: 'INSERT',
        payload: {
          'id': quoteId,
          'clientId': _selectedCliente!.id,
          'items': _items.map((i) => i.toJson()).toList(),
          'validityDays': _validityDays,
        },
        priority: 5,
      );

      // Tentar sync imediato se online
      final syncRepo = ref.read(syncRepositoryProvider);
      if (await syncRepo.isOnline) {
        await syncRepo.performSync();
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cotação criada com sucesso!'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  Map<String, double> _calculateTotals() {
    double subtotal = 0;
    double totalDescontos = 0;
    double totalIva = 0;

    for (final item in _items) {
      final itemSubtotal = item.quantidade * item.precoUnit;
      final itemDesconto = itemSubtotal * (item.descontoPercent / 100);
      final baseIva = itemSubtotal - itemDesconto;
      final itemIva = baseIva * (item.ivaPercent / 100);

      subtotal += itemSubtotal;
      totalDescontos += itemDesconto;
      totalIva += itemIva;
    }

    return {
      'subtotal': subtotal,
      'totalDescontos': totalDescontos,
      'totalIva': totalIva,
      'totalGeral': subtotal - totalDescontos + totalIva,
    };
  }

  void _addItem() {
    final descricao = _descricaoController.text.trim();
    final quantidade = int.tryParse(_quantidadeController.text) ?? 1;
    final preco = double.tryParse(_precoController.text.replaceAll(',', '.')) ?? 0;
    final desconto = double.tryParse(_descontoController.text) ?? 0;

    if (descricao.isEmpty || preco <= 0) return;

    setState(() {
      _items.add(QuoteItem(
        produtoId: 'manual-${DateTime.now().millisecondsSinceEpoch}',
        descricao: descricao,
        quantidade: quantidade,
        precoUnit: preco,
        descontoPercent: desconto,
        ivaPercent: 16,
      ));
    });

    _descricaoController.clear();
    _quantidadeController.text = '1';
    _precoController.clear();
    _descontoController.text = '0';
  }

  void _removeItem(int index) {
    setState(() => _items.removeAt(index));
  }

  void _scanProduct() async {
    final result = await Navigator.push<String>(
      context,
      MaterialPageRoute(builder: (_) => const ProductScannerScreen()),
    );

    if (result != null) {
      // Buscar produto pelo código escaneado
      // Por enquanto, apenas preencher o campo
      _descricaoController.text = 'Produto $result';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: const Text('Nova Cotação'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Progress Indicator
          _buildProgressIndicator(),
          
          // Content
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _buildStepContent(),
            ),
          ),
          
          // Navigation Buttons
          _buildNavigationButtons(),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          _buildStepIndicator(0, 'Cliente', Icons.person),
          _buildStepLine(0),
          _buildStepIndicator(1, 'Itens', Icons.shopping_cart),
          _buildStepLine(1),
          _buildStepIndicator(2, 'Revisão', Icons.check_circle),
        ],
      ),
    );
  }

  Widget _buildStepIndicator(int step, String label, IconData icon) {
    final isActive = _currentStep >= step;
    final isCurrent = _currentStep == step;
    
    return Expanded(
      child: Column(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isActive ? AppColors.primary : AppColors.surface,
              border: Border.all(
                color: isActive ? AppColors.primary : AppColors.border,
                width: 2,
              ),
            ),
            child: Icon(
              icon,
              color: isActive ? Colors.white : AppColors.textMuted,
              size: 20,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              color: isCurrent ? AppColors.primary : AppColors.textMuted,
              fontSize: 12,
              fontWeight: isCurrent ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepLine(int step) {
    final isCompleted = _currentStep > step;
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 20),
        color: isCompleted ? AppColors.primary : AppColors.border,
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildStep1Cliente();
      case 1:
        return _buildStep2Itens();
      case 2:
        return _buildStep3Revisao();
      default:
        return const SizedBox.shrink();
    }
  }

  // ==========================================================================
  // STEP 1: SELECIONAR CLIENTE
  // ==========================================================================
  Widget _buildStep1Cliente() {
    final clientesAsync = ref.watch(clientesSearchProvider(_searchController.text));
    
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: _searchController,
            onChanged: (value) => ref.refresh(clientesSearchProvider(value)),
            decoration: InputDecoration(
              hintText: 'Buscar cliente...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: IconButton(
                icon: const Icon(Icons.qr_code_scanner),
                onPressed: () {
                  // Scan NUIT do cartão
                },
              ),
              filled: true,
              fillColor: AppColors.surface,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          if (_selectedCliente != null)
            _buildSelectedClienteCard(),
          
          const SizedBox(height: 16),
          const Text(
            'Clientes',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          
          Expanded(
            child: clientesAsync.when(
              data: (clientes) => ListView.builder(
                itemCount: clientes.length,
                itemBuilder: (context, index) {
                  final cliente = clientes[index];
                  final isSelected = _selectedCliente?.id == cliente.id;
                  
                  return ListTile(
                    onTap: () => setState(() => _selectedCliente = cliente),
                    leading: CircleAvatar(
                      backgroundColor: isSelected ? AppColors.primary : AppColors.surface,
                      child: Text(
                        cliente.nome[0].toUpperCase(),
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppColors.text,
                        ),
                      ),
                    ),
                    title: Text(cliente.nome),
                    subtitle: Text(cliente.nif ?? 'Sem NIF'),
                    trailing: isSelected
                        ? const Icon(Icons.check_circle, color: AppColors.success)
                        : null,
                    tileColor: isSelected ? AppColors.primary.withOpacity(0.1) : null,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  );
                },
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Center(child: Text('Erro: $err')),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectedClienteCard() {
    return FiscalCard(
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: AppColors.primary,
            child: Text(
              _selectedCliente!.nome[0].toUpperCase(),
              style: const TextStyle(color: Colors.white),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _selectedCliente!.nome,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                Text(
                  _selectedCliente!.nif ?? 'Sem NIF',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => setState(() => _selectedCliente = null),
          ),
        ],
      ),
    );
  }

  // ==========================================================================
  // STEP 2: ADICIONAR ITENS
  // ==========================================================================
  Widget _buildStep2Itens() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Formulário de adicionar item
          FiscalCard(
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: TextField(
                        controller: _descricaoController,
                        decoration: const InputDecoration(
                          labelText: 'Descrição',
                          hintText: 'Nome do produto/serviço',
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      onPressed: _scanProduct,
                      icon: const Icon(Icons.qr_code_scanner),
                      tooltip: 'Escanear produto',
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _quantidadeController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Qtd',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: TextField(
                        controller: _precoController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Preço (MZN)',
                          prefixText: 'MT ',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _descontoController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Desc %',
                          suffixText: '%',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _addItem,
                    icon: const Icon(Icons.add),
                    label: const Text('Adicionar Item'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Lista de itens
          Expanded(
            child: _items.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.shopping_cart_outlined,
                          size: 64,
                          color: AppColors.textMuted.withOpacity(0.5),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Nenhum item adicionado',
                          style: TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: _items.length,
                    itemBuilder: (context, index) {
                      final item = _items[index];
                      return Dismissible(
                        key: Key('item-$index'),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 16),
                          color: AppColors.error,
                          child: const Icon(Icons.delete, color: Colors.white),
                        ),
                        onDismissed: (_) => _removeItem(index),
                        child: FiscalCard(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.descricao,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${item.quantidade} × ${Formatters.currency(item.precoUnit)}',
                                      style: TextStyle(
                                        color: AppColors.textMuted,
                                        fontSize: 13,
                                      ),
                                    ),
                                    if (item.descontoPercent > 0)
                                      Text(
                                        'Desconto: ${item.descontoPercent.toStringAsFixed(0)}%',
                                        style: const TextStyle(
                                          color: AppColors.success,
                                          fontSize: 12,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              Text(
                                Formatters.currency(item.totalLinha),
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontFamily: 'JetBrainsMono',
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  // ==========================================================================
  // STEP 3: REVISÃO
  // ==========================================================================
  Widget _buildStep3Revisao() {
    final totals = _calculateTotals();
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Resumo Cliente
          const Text(
            'Cliente',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          FiscalCard(
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppColors.primary,
                  child: Text(
                    _selectedCliente!.nome[0].toUpperCase(),
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _selectedCliente!.nome,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        _selectedCliente!.nif ?? 'Sem NIF',
                        style: TextStyle(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Resumo Itens
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Itens',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                '${_items.length} ${_items.length == 1 ? 'item' : 'itens'}',
                style: TextStyle(color: AppColors.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ..._items.map((item) => FiscalCard(
            margin: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.descricao),
                      Text(
                        '${item.quantidade} × ${Formatters.currency(item.precoUnit)}',
                        style: TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  Formatters.currency(item.totalLinha),
                  style: const TextStyle(fontFamily: 'JetBrainsMono'),
                ),
              ],
            ),
          )),
          
          const SizedBox(height: 24),
          
          // Validade
          const Text(
            'Validade',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          SegmentedButton<int>(
            segments: const [
              ButtonSegment(value: 7, label: Text('7 dias')),
              ButtonSegment(value: 15, label: Text('15 dias')),
              ButtonSegment(value: 30, label: Text('30 dias')),
            ],
            selected: {_validityDays},
            onSelectionChanged: (value) {
              setState(() => _validityDays = value.first);
            },
          ),
          
          const SizedBox(height: 24),
          
          // Totais
          FiscalCard(
            backgroundColor: AppColors.surface,
            child: Column(
              children: [
                _buildTotalRow('Subtotal', totals['subtotal']!),
                if (totals['totalDescontos']! > 0)
                  _buildTotalRow('Descontos', -totals['totalDescontos']!, isDiscount: true),
                _buildTotalRow('IVA (16%)', totals['totalIva']!),
                const Divider(height: 24),
                _buildTotalRow('TOTAL', totals['totalGeral']!, isTotal: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTotalRow(String label, double value, {bool isTotal = false, bool isDiscount = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 16 : 14,
              fontWeight: isTotal ? FontWeight.w600 : FontWeight.normal,
              color: isDiscount ? AppColors.success : null,
            ),
          ),
          Text(
            Formatters.currency(value),
            style: TextStyle(
              fontSize: isTotal ? 18 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
              fontFamily: 'JetBrainsMono',
              color: isDiscount ? AppColors.success : null,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationButtons() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        border: Border(
          top: BorderSide(color: AppColors.border),
        ),
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (_currentStep > 0)
              Expanded(
                child: OutlinedButton(
                  onPressed: _previousStep,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: BorderSide(color: AppColors.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Voltar'),
                ),
              ),
            if (_currentStep > 0) const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: _currentStep == 2 
                    ? (_isSubmitting ? null : _submitQuote)
                    : (_canProceed() ? _nextStep : null),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  disabledBackgroundColor: AppColors.primary.withOpacity(0.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Text(_currentStep == 2 ? 'Criar Cotação' : 'Continuar'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool _canProceed() {
    switch (_currentStep) {
      case 0:
        return _selectedCliente != null;
      case 1:
        return _items.isNotEmpty;
      default:
        return true;
    }
  }
}

// ============================================================================
// PRODUCT SCANNER SCREEN
// ============================================================================
class ProductScannerScreen extends StatelessWidget {
  const ProductScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: MobileScanner(
        onDetect: (capture) {
          final barcodes = capture.barcodes;
          if (barcodes.isNotEmpty) {
            final code = barcodes.first.rawValue;
            if (code != null) {
              Navigator.pop(context, code);
            }
          }
        },
        overlay: Container(
          decoration: BoxDecoration(
            border: Border.all(
              color: AppColors.primary,
              width: 2,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}
