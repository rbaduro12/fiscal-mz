// ============================================================================
// FISCAL.MZ 2.0 - PaymentBottomSheet Widget
// Payment Orchestration - Linear-inspired Design
// ============================================================================

import 'package:flutter/material.dart';
import 'design_tokens.dart';

// =============================================================================
// ENUMS & MODELS
// =============================================================================

enum MetodoPagamento {
  mpesa,
  emola,
  bim,
  cartaoDebito,
  cartaoCredito,
  cash,
  escrow,
}

enum PaymentStep {
  metodo,
  resumo,
  processando,
  sucesso,
  erro,
}

class ProformaResumo {
  final String numero;
  final DateTime dataEmissao;
  final double totalGeral;
  final String condicoesPagamento;

  const ProformaResumo({
    required this.numero,
    required this.dataEmissao,
    required this.totalGeral,
    required this.condicoesPagamento,
  });
}

// =============================================================================
// MÉTODOS CONFIG
// =============================================================================

class _MetodoConfig {
  final String label;
  final String descricao;
  final IconData icon;
  final List<Color> gradient;
  final bool disponivel;
  final String? tempoProcessamento;

  const _MetodoConfig({
    required this.label,
    required this.descricao,
    required this.icon,
    required this.gradient,
    this.disponivel = true,
    this.tempoProcessamento,
  });
}

final Map<MetodoPagamento, _MetodoConfig> _metodosConfig = {
  MetodoPagamento.mpesa: const _MetodoConfig(
    label: 'M-Pesa',
    descricao: 'Pagamento via M-Pesa',
    icon: Icons.smartphone,
    gradient: [Color(0xFFEF4444), Color(0xFFDC2626)],
    tempoProcessamento: 'Instantâneo',
  ),
  MetodoPagamento.emola: const _MetodoConfig(
    label: 'EMola',
    descricao: 'Pagamento via EMola',
    icon: Icons.smartphone,
    gradient: [Color(0xFFF97316), Color(0xFFEA580C)],
    tempoProcessamento: 'Instantâneo',
  ),
  MetodoPagamento.bim: const _MetodoConfig(
    label: 'BIM',
    descricao: 'Pagamento via BIM',
    icon: Icons.smartphone,
    gradient: [Color(0xFF3B82F6), Color(0xFF2563EB)],
    tempoProcessamento: 'Instantâneo',
  ),
  MetodoPagamento.cartaoDebito: const _MetodoConfig(
    label: 'Cartão Débito',
    descricao: 'Visa, Mastercard',
    icon: Icons.credit_card,
    gradient: [Color(0xFFA855F7), Color(0xFF9333EA)],
    tempoProcessamento: 'Instantâneo',
  ),
  MetodoPagamento.cartaoCredito: const _MetodoConfig(
    label: 'Cartão Crédito',
    descricao: 'Visa, Mastercard',
    icon: Icons.credit_card,
    gradient: [Color(0xFF6366F1), Color(0xFF4F46E5)],
    tempoProcessamento: 'Instantâneo',
  ),
  MetodoPagamento.cash: const _MetodoConfig(
    label: 'Dinheiro',
    descricao: 'Pagamento em mãos',
    icon: Icons.payments,
    gradient: [Color(0xFF22C55E), Color(0xFF16A34A)],
    tempoProcessamento: 'Na entrega',
  ),
  MetodoPagamento.escrow: const _MetodoConfig(
    label: 'Garantia (Escrow)',
    descricao: 'Pagamento protegido',
    icon: Icons.shield,
    gradient: [Color(0xFF5E6AD2), Color(0xFF8B5CF6)],
    tempoProcessamento: 'Após confirmação',
  ),
};

// =============================================================================
// PAYMENT BOTTOM SHEET
// =============================================================================

class PaymentBottomSheet extends StatefulWidget {
  final ProformaResumo proforma;
  final String clienteNome;
  final String tenantNome;
  final String moeda;
  final Future<bool> Function(MetodoPagamento metodo, {String? telefone}) onProcessPayment;

  const PaymentBottomSheet({
    super.key,
    required this.proforma,
    required this.clienteNome,
    required this.tenantNome,
    this.moeda = 'MZN',
    required this.onProcessPayment,
  });

  static Future<void> show({
    required BuildContext context,
    required ProformaResumo proforma,
    required String clienteNome,
    required String tenantNome,
    String moeda = 'MZN',
    required Future<bool> Function(MetodoPagamento metodo, {String? telefone}) onProcessPayment,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PaymentBottomSheet(
        proforma: proforma,
        clienteNome: clienteNome,
        tenantNome: tenantNome,
        moeda: moeda,
        onProcessPayment: onProcessPayment,
      ),
    );
  }

  @override
  State<PaymentBottomSheet> createState() => _PaymentBottomSheetState();
}

class _PaymentBottomSheetState extends State<PaymentBottomSheet>
    with TickerProviderStateMixin {
  PaymentStep _step = PaymentStep.metodo;
  MetodoPagamento? _metodoSelecionado;
  String _telefone = '';
  bool _isProcessing = false;
  String _errorMessage = '';

  late AnimationController _spinController;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _spinController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _spinController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  String _formatCurrency(double value) {
    return '${widget.moeda} ${value.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  void _selectMetodo(MetodoPagamento metodo) {
    setState(() {
      _metodoSelecionado = metodo;
      _step = PaymentStep.resumo;
    });
  }

  Future<void> _processPayment() async {
    if (_metodoSelecionado == null) return;

    setState(() {
      _step = PaymentStep.processando;
      _isProcessing = true;
    });
    _spinController.repeat();

    try {
      final success = await widget.onProcessPayment(
        _metodoSelecionado!,
        telefone: _telefone.isNotEmpty ? _telefone : null,
      );

      if (success) {
        setState(() {
          _step = PaymentStep.sucesso;
        });
      } else {
        setState(() {
          _step = PaymentStep.erro;
          _errorMessage = 'Erro ao processar pagamento';
        });
      }
    } catch (e) {
      setState(() {
        _step = PaymentStep.erro;
        _errorMessage = 'Erro inesperado. Tente novamente.';
      });
    } finally {
      _spinController.stop();
      setState(() {
        _isProcessing = false;
      });
    }
  }

  void _goBack() {
    if (_step == PaymentStep.resumo) {
      setState(() {
        _step = PaymentStep.metodo;
        _metodoSelecionado = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: FmColors.bgSecondary,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(FmRadius.xxl),
        ),
      ),
      child: Column(
        children: [
          // Handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: FmSpacing.space3),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: FmColors.border,
                borderRadius: BorderRadius.circular(FmRadius.full),
              ),
            ),
          ),

          // Header
          _buildHeader(),

          const Divider(color: FmColors.border, height: 1),

          // Content
          Expanded(
            child: AnimatedSwitcher(
              duration: FmDurations.slow,
              switchInCurve: FmCurves.easeInOut,
              switchOutCurve: FmCurves.easeInOut,
              child: _buildContent(),
            ),
          ),

          // Progress indicator
          if (_step == PaymentStep.metodo || _step == PaymentStep.resumo)
            _buildProgressFooter(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    String title = '';
    String subtitle = '${widget.proforma.numero} • ${_formatCurrency(widget.proforma.totalGeral)}';

    switch (_step) {
      case PaymentStep.metodo:
        title = 'Método de Pagamento';
        break;
      case PaymentStep.resumo:
        title = 'Confirmar Pagamento';
        break;
      case PaymentStep.processando:
        title = 'Processando...';
        break;
      case PaymentStep.sucesso:
        title = 'Pagamento Concluído';
        break;
      case PaymentStep.erro:
        title = 'Erro no Pagamento';
        break;
    }

    return Padding(
      padding: const EdgeInsets.all(FmSpacing.space5),
      child: Row(
        children: [
          if (_step == PaymentStep.resumo)
            IconButton(
              onPressed: _goBack,
              icon: const Icon(Icons.arrow_back_ios, size: 20),
              color: FmColors.textSecondary,
            ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: FmTypography.headline,
                ),
                Text(
                  subtitle,
                  style: FmTypography.caption,
                ),
              ],
            ),
          ),
          if (_step != PaymentStep.processando)
            IconButton(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.close),
              color: FmColors.textSecondary,
            ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    switch (_step) {
      case PaymentStep.metodo:
        return _buildMetodoSelection();
      case PaymentStep.resumo:
        return _buildResumo();
      case PaymentStep.processando:
        return _buildProcessando();
      case PaymentStep.sucesso:
        return _buildSucesso();
      case PaymentStep.erro:
        return _buildErro();
    }
  }

  Widget _buildMetodoSelection() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(FmSpacing.space5),
      child: Column(
        children: [
          ...MetodoPagamento.values.where((m) => _metodosConfig[m]!.disponivel).map(
            (metodo) => _buildMetodoCard(metodo),
          ),
          const SizedBox(height: FmSpacing.space6),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock, size: 14, color: FmColors.textMuted),
              const SizedBox(width: FmSpacing.space2),
              Text(
                'Pagamento seguro e encriptado',
                style: FmTypography.caption.copyWith(color: FmColors.textMuted),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetodoCard(MetodoPagamento metodo) {
    final config = _metodosConfig[metodo]!;

    return GestureDetector(
      onTap: () => _selectMetodo(metodo),
      child: Container(
        margin: const EdgeInsets.only(bottom: FmSpacing.space3),
        padding: const EdgeInsets.all(FmSpacing.space4),
        decoration: BoxDecoration(
          color: FmColors.bgTertiary,
          borderRadius: BorderRadius.circular(FmRadius.xl),
          border: Border.all(color: FmColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: config.gradient,
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(FmRadius.lg),
                boxShadow: FmShadows.md,
              ),
              child: Icon(
                config.icon,
                color: Colors.white,
                size: 24,
              ),
            ),
            const SizedBox(width: FmSpacing.space4),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    config.label,
                    style: FmTypography.title,
                  ),
                  Text(
                    config.descricao,
                    style: FmTypography.body.copyWith(color: FmColors.textSecondary),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Icon(Icons.chevron_right, color: FmColors.textMuted),
                if (config.tempoProcessamento != null)
                  Text(
                    config.tempoProcessamento!,
                    style: FmTypography.small.copyWith(color: FmColors.textMuted),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResumo() {
    final config = _metodosConfig[_metodoSelecionado]!;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(FmSpacing.space5),
      child: Column(
        children: [
          // Proforma card
          Container(
            padding: const EdgeInsets.all(FmSpacing.space5),
            decoration: BoxDecoration(
              color: FmColors.bgTertiary,
              borderRadius: BorderRadius.circular(FmRadius.xl),
              border: Border.all(color: FmColors.border),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0x265E6AD2),
                        borderRadius: BorderRadius.circular(FmRadius.md),
                      ),
                      child: const Icon(
                        Icons.description_outlined,
                        color: FmColors.accentPrimary,
                      ),
                    ),
                    const SizedBox(width: FmSpacing.space3),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.proforma.numero,
                            style: FmTypography.body.copyWith(
                              fontWeight: FmTypography.weightMedium,
                            ),
                          ),
                          Text(
                            'Emitida em ${_formatDate(widget.proforma.dataEmissao)}',
                            style: FmTypography.caption,
                          ),
                        ],
                      ),
                    ),
                    Text(
                      _formatCurrency(widget.proforma.totalGeral),
                      style: FmTypography.display.copyWith(fontSize: 24),
                    ),
                  ],
                ),
                const Divider(color: FmColors.border, height: FmSpacing.space6),
                _buildInfoRow('De', widget.tenantNome),
                const SizedBox(height: FmSpacing.space2),
                _buildInfoRow('Para', widget.clienteNome),
                const SizedBox(height: FmSpacing.space2),
                _buildInfoRow('Condição', _getCondicaoLabel()),
              ],
            ),
          ),

          const SizedBox(height: FmSpacing.space5),

          // Selected method
          Container(
            padding: const EdgeInsets.all(FmSpacing.space4),
            decoration: BoxDecoration(
              color: FmColors.bgTertiary.withOpacity(0.5),
              borderRadius: BorderRadius.circular(FmRadius.lg),
              border: Border.all(color: FmColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: config.gradient),
                    borderRadius: BorderRadius.circular(FmRadius.md),
                  ),
                  child: Icon(config.icon, color: Colors.white),
                ),
                const SizedBox(width: FmSpacing.space3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(config.label, style: FmTypography.body.copyWith(fontWeight: FmTypography.weightMedium)),
                      Text(config.tempoProcessamento ?? '', style: FmTypography.caption),
                    ],
                  ),
                ),
                TextButton(
                  onPressed: _goBack,
                  child: const Text('Alterar'),
                ),
              ],
            ),
          ),

          const SizedBox(height: FmSpacing.space5),

          // Phone input for mobile payments
          if (_metodoSelecionado == MetodoPagamento.mpesa ||
              _metodoSelecionado == MetodoPagamento.emola ||
              _metodoSelecionado == MetodoPagamento.bim)
            TextField(
              onChanged: (value) => setState(() => _telefone = value),
              keyboardType: TextInputType.phone,
              style: FmTypography.mono,
              decoration: InputDecoration(
                hintText: '+258 84 000 0000',
                prefixIcon: const Icon(Icons.smartphone, color: FmColors.textMuted),
                filled: true,
                fillColor: FmColors.bgTertiary,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(FmRadius.md),
                  borderSide: const BorderSide(color: FmColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(FmRadius.md),
                  borderSide: const BorderSide(color: FmColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(FmRadius.md),
                  borderSide: const BorderSide(color: FmColors.accentPrimary),
                ),
              ),
            ),

          // Escrow warning
          if (_metodoSelecionado == MetodoPagamento.escrow)
            Container(
              padding: const EdgeInsets.all(FmSpacing.space4),
              decoration: BoxDecoration(
                color: FmColors.warningDim,
                borderRadius: BorderRadius.circular(FmRadius.lg),
                border: Border.all(color: FmColors.warning.withOpacity(0.3)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.shield, color: FmColors.warning, size: 20),
                  const SizedBox(width: FmSpacing.space3),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Pagamento em Garantia',
                          style: FmTypography.body.copyWith(fontWeight: FmTypography.weightMedium),
                        ),
                        const SizedBox(height: FmSpacing.space1),
                        Text(
                          'O valor será retido até a confirmação de entrega. O vendedor só receberá após você confirmar o recebimento.',
                          style: FmTypography.caption,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: FmSpacing.space6),

          // Pay button
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton.icon(
              onPressed: (_telefone.isNotEmpty ||
                      (_metodoSelecionado != MetodoPagamento.mpesa &&
                          _metodoSelecionado != MetodoPagamento.emola &&
                          _metodoSelecionado != MetodoPagamento.bim))
                  ? _processPayment
                  : null,
              icon: const Icon(Icons.account_balance_wallet),
              label: Text(
                'Pagar ${_formatCurrency(widget.proforma.totalGeral)}',
                style: FmTypography.title.copyWith(color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: FmColors.accentPrimary,
                disabledBackgroundColor: FmColors.accentPrimary.withOpacity(0.5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(FmRadius.xl),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: FmTypography.body.copyWith(color: FmColors.textSecondary)),
        Text(value, style: FmTypography.body),
      ],
    );
  }

  String _getCondicaoLabel() {
    switch (widget.proforma.condicoesPagamento) {
      case 'IMMEDIATO':
        return 'Imediato';
      case '30_DIAS':
        return '30 Dias';
      case '50_50':
        return '50% / 50%';
      case 'ESCROW':
        return 'Garantia';
      default:
        return widget.proforma.condicoesPagamento;
    }
  }

  Widget _buildProcessando() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              RotationTransition(
                turns: _spinController,
                child: const Icon(
                  Icons.sync,
                  size: 80,
                  color: FmColors.accentPrimary,
                ),
              ),
              AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  return Container(
                    width: 80 + (_pulseController.value * 20),
                    height: 80 + (_pulseController.value * 20),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: FmColors.accentPrimary.withOpacity(0.2 * (1 - _pulseController.value)),
                    ),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: FmSpacing.space6),
          Text(
            'Processando pagamento',
            style: FmTypography.headline,
          ),
          const SizedBox(height: FmSpacing.space2),
          Text(
            'Por favor, aguarde enquanto processamos seu pagamento de ${_formatCurrency(widget.proforma.totalGeral)}',
            style: FmTypography.body.copyWith(color: FmColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: FmSpacing.space8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildDot(0),
              const SizedBox(width: FmSpacing.space2),
              _buildDot(1),
              const SizedBox(width: FmSpacing.space2),
              _buildDot(2),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDot(int index) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        final delay = index * 0.3;
        final value = (_pulseController.value + delay) % 1.0;
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: FmColors.accentPrimary.withOpacity(0.3 + (value * 0.7)),
          ),
        );
      },
    );
  }

  Widget _buildSucesso() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          TweenAnimationBuilder(
            tween: Tween<double>(begin: 0, end: 1),
            duration: FmDurations.slower,
            curve: FmCurves.bounce,
            builder: (context, value, child) {
              return Transform.scale(
                scale: value,
                child: Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: FmColors.successDim,
                    shape: BoxShape.circle,
                    boxShadow: FmShadows.glowSuccess,
                  ),
                  child: const Icon(
                    Icons.check_circle_outline,
                    size: 48,
                    color: FmColors.success,
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: FmSpacing.space6),
          Text(
            'Pagamento confirmado!',
            style: FmTypography.headline.copyWith(color: FmColors.success),
          ),
          const SizedBox(height: FmSpacing.space2),
          Text(
            'Seu pagamento de ${_formatCurrency(widget.proforma.totalGeral)} foi processado com sucesso.',
            style: FmTypography.body.copyWith(color: FmColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: FmSpacing.space8),
          Container(
            padding: const EdgeInsets.all(FmSpacing.space4),
            decoration: BoxDecoration(
              color: FmColors.bgTertiary,
              borderRadius: BorderRadius.circular(FmRadius.lg),
              border: Border.all(color: FmColors.border),
            ),
            child: Column(
              children: [
                _buildInfoRow('Referência', widget.proforma.numero),
                const SizedBox(height: FmSpacing.space2),
                _buildInfoRow('Data', _formatDate(DateTime.now())),
              ],
            ),
          ),
          const SizedBox(height: FmSpacing.space8),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: FmColors.success,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(FmRadius.xl),
                ),
              ),
              child: Text(
                'Concluir',
                style: FmTypography.title.copyWith(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErro() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              color: FmColors.errorDim,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.error_outline,
              size: 48,
              color: FmColors.error,
            ),
          ),
          const SizedBox(height: FmSpacing.space6),
          Text(
            'Erro no pagamento',
            style: FmTypography.headline.copyWith(color: FmColors.error),
          ),
          const SizedBox(height: FmSpacing.space2),
          Text(
            _errorMessage,
            style: FmTypography.body.copyWith(color: FmColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: FmSpacing.space2),
          Text(
            'Verifique seus dados e tente novamente.',
            style: FmTypography.caption.copyWith(color: FmColors.textMuted),
          ),
          const SizedBox(height: FmSpacing.space8),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => setState(() => _step = PaymentStep.resumo),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: FmSpacing.space3),
                  ),
                  child: const Text('Voltar'),
                ),
              ),
              const SizedBox(width: FmSpacing.space3),
              Expanded(
                child: ElevatedButton(
                  onPressed: _processPayment,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: FmColors.accentPrimary,
                    padding: const EdgeInsets.symmetric(vertical: FmSpacing.space3),
                  ),
                  child: const Text('Tentar novamente'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgressFooter() {
    return Container(
      padding: const EdgeInsets.all(FmSpacing.space5),
      decoration: BoxDecoration(
        color: FmColors.bgTertiary.withOpacity(0.3),
        border: const Border(
          top: BorderSide(color: FmColors.border),
        ),
      ),
      child: Row(
        children: [
          Text(
            'Passo ${_step == PaymentStep.metodo ? '1' : '2'} de 2',
            style: FmTypography.caption.copyWith(color: FmColors.textMuted),
          ),
          const SizedBox(width: FmSpacing.space3),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  flex: 1,
                  child: Container(
                    height: 4,
                    decoration: BoxDecoration(
                      color: _step == PaymentStep.metodo ? FmColors.accentPrimary : FmColors.accentPrimary.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(FmRadius.full),
                    ),
                  ),
                ),
                const SizedBox(width: FmSpacing.space2),
                Expanded(
                  flex: 1,
                  child: Container(
                    height: 4,
                    decoration: BoxDecoration(
                      color: _step == PaymentStep.resumo ? FmColors.accentPrimary : FmColors.border,
                      borderRadius: BorderRadius.circular(FmRadius.full),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
