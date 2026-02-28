// ============================================================================
// FISCAL.MZ 2.0 - NegotiationCard Widget
// B2B Workflow - Linear-inspired Design
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'design_tokens.dart';

// =============================================================================
// ENUMS & MODELS
// =============================================================================

enum CotacaoStatus {
  rascunho,
  enviada,
  negociando,
  aceite,
  rejeitada,
  convertida,
  vencida,
}

enum HistoricoTipo {
  alteracaoPreco,
  alteracaoQtd,
  counterOffer,
  comentario,
  envio,
  aceite,
  rejeite,
}

class HistoricoItem {
  final String id;
  final DateTime data;
  final String autor;
  final String autorTipo;
  final HistoricoTipo tipo;
  final String? campoAfectado;
  final double? valorAnterior;
  final double? valorNovo;
  final String? comentario;

  const HistoricoItem({
    required this.id,
    required this.data,
    required this.autor,
    required this.autorTipo,
    required this.tipo,
    this.campoAfectado,
    this.valorAnterior,
    this.valorNovo,
    this.comentario,
  });
}

class ItemCotacao {
  final String produtoId;
  final String descricao;
  final double quantidade;
  final double precoUnit;
  final double descontoPercent;
  final double ivaPercent;
  final double totalLinha;

  const ItemCotacao({
    required this.produtoId,
    required this.descricao,
    required this.quantidade,
    required this.precoUnit,
    this.descontoPercent = 0.0,
    this.ivaPercent = 16.0,
    required this.totalLinha,
  });
}

class ProformaInfo {
  final String numero;
  final String status;

  const ProformaInfo({
    required this.numero,
    required this.status,
  });
}

// =============================================================================
// STATUS CONFIGURATION
// =============================================================================

class _StatusConfig {
  final String label;
  final Color color;
  final Color bgColor;
  final IconData icon;
  final Color dotColor;
  final bool pulse;

  const _StatusConfig({
    required this.label,
    required this.color,
    required this.bgColor,
    required this.icon,
    required this.dotColor,
    this.pulse = false,
  });
}

final Map<CotacaoStatus, _StatusConfig> _statusConfigs = {
  CotacaoStatus.rascunho: _StatusConfig(
    label: 'Rascunho',
    color: FmColors.textMuted,
    bgColor: FmColors.bgTertiary,
    icon: Icons.edit_document,
    dotColor: FmColors.textMuted,
  ),
  CotacaoStatus.enviada: _StatusConfig(
    label: 'Enviada',
    color: FmColors.info,
    bgColor: FmColors.infoDim,
    icon: Icons.send,
    dotColor: FmColors.info,
    pulse: true,
  ),
  CotacaoStatus.negociando: _StatusConfig(
    label: 'Em Negociação',
    color: FmColors.warning,
    bgColor: FmColors.warningDim,
    icon: Icons.chat_bubble_outline,
    dotColor: FmColors.warning,
    pulse: true,
  ),
  CotacaoStatus.aceite: _StatusConfig(
    label: 'Aceite',
    color: FmColors.success,
    bgColor: FmColors.successDim,
    icon: Icons.check_circle_outline,
    dotColor: FmColors.success,
  ),
  CotacaoStatus.convertida: _StatusConfig(
    label: 'Convertida',
    color: FmColors.accentPrimary,
    bgColor: const Color(0x265E6AD2),
    icon: Icons.description_outlined,
    dotColor: FmColors.accentPrimary,
  ),
  CotacaoStatus.rejeitada: _StatusConfig(
    label: 'Rejeitada',
    color: FmColors.error,
    bgColor: FmColors.errorDim,
    icon: Icons.cancel_outlined,
    dotColor: FmColors.error,
  ),
  CotacaoStatus.vencida: _StatusConfig(
    label: 'Vencida',
    color: FmColors.textMuted,
    bgColor: FmColors.bgTertiary,
    icon: Icons.schedule,
    dotColor: FmColors.textMuted,
  ),
};

// =============================================================================
// WIDGET PRINCIPAL
// =============================================================================

class NegotiationCard extends StatefulWidget {
  final String numeroCotacao;
  final CotacaoStatus status;
  final String clienteNome;
  final String? clienteAvatar;
  final DateTime dataCriacao;
  final DateTime validadeAte;
  final double totalEstimado;
  final String moeda;
  final List<ItemCotacao> itens;
  final List<HistoricoItem> historico;
  final ProformaInfo? proformaGerada;
  final VoidCallback? onVerProforma;
  final VoidCallback? onEnviar;
  final VoidCallback? onAceitar;
  final VoidCallback? onRejeitar;
  final VoidCallback? onCounterOffer;
  final bool isLoading;

  const NegotiationCard({
    super.key,
    required this.numeroCotacao,
    required this.status,
    required this.clienteNome,
    this.clienteAvatar,
    required this.dataCriacao,
    required this.validadeAte,
    required this.totalEstimado,
    this.moeda = 'MZN',
    required this.itens,
    required this.historico,
    this.proformaGerada,
    this.onVerProforma,
    this.onEnviar,
    this.onAceitar,
    this.onRejeitar,
    this.onCounterOffer,
    this.isLoading = false,
  });

  @override
  State<NegotiationCard> createState() => _NegotiationCardState();
}

class _NegotiationCardState extends State<NegotiationCard>
    with SingleTickerProviderStateMixin {
  bool _isExpanded = false;
  bool _showTimeline = false;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  String _formatCurrency(double value) {
    return '${widget.moeda} ${value.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  int get _diasRestantes {
    return widget.validadeAte.difference(DateTime.now()).inDays;
  }

  @override
  Widget build(BuildContext context) {
    final config = _statusConfigs[widget.status]!;

    return AnimatedContainer(
      duration: FmDurations.slow,
      curve: FmCurves.easeInOut,
      decoration: BoxDecoration(
        color: FmColors.bgSecondary,
        borderRadius: BorderRadius.circular(FmRadius.lg),
        border: Border.all(
          color: _isExpanded ? FmColors.accentPrimary.withOpacity(0.3) : FmColors.border,
        ),
        boxShadow: _isExpanded ? FmShadows.md : null,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(FmRadius.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Glow indicator for active states
            if (config.pulse)
              Container(
                height: 2,
                width: double.infinity,
                color: config.dotColor.withOpacity(0.6),
              ),

            // Header
            Padding(
              padding: const EdgeInsets.all(FmSpacing.space5),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status dot with timeline connector
                      Column(
                        children: [
                          _buildStatusDot(config),
                          Container(
                            width: 1,
                            height: 40,
                            color: FmColors.border.withOpacity(0.3),
                          ),
                        ],
                      ),
                      const SizedBox(width: FmSpacing.space4),

                      // Main info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Meta info row
                            Row(
                              children: [
                                Text(
                                  widget.numeroCotacao,
                                  style: FmTypography.monoCaption,
                                ),
                                const SizedBox(width: FmSpacing.space2),
                                Text(
                                  '•',
                                  style: FmTypography.caption.copyWith(
                                    color: FmColors.textMuted,
                                  ),
                                ),
                                const SizedBox(width: FmSpacing.space2),
                                Text(
                                  _formatDate(widget.dataCriacao),
                                  style: FmTypography.caption.copyWith(
                                    color: FmColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: FmSpacing.space1),

                            // Client name
                            Text(
                              widget.clienteNome,
                              style: FmTypography.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: FmSpacing.space2),

                            // Status badges row
                            Wrap(
                              spacing: FmSpacing.space2,
                              runSpacing: FmSpacing.space2,
                              children: [
                                _buildStatusBadge(config),
                                if (widget.proformaGerada != null)
                                  _buildProformaBadge(),
                                if (_diasRestantes > 0 &&
                                    widget.status != CotacaoStatus.convertida &&
                                    widget.status != CotacaoStatus.rejeitada)
                                  _buildDiasBadge(),
                              ],
                            ),
                          ],
                        ),
                      ),

                      // Value and actions
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            _formatCurrency(widget.totalEstimado),
                            style: FmTypography.display.copyWith(
                              fontSize: 28,
                              fontFamily: FmTypography.fontMono,
                            ),
                          ),
                          Text(
                            '${widget.itens.length} ${widget.itens.length == 1 ? 'item' : 'itens'}',
                            style: FmTypography.caption,
                          ),
                          const SizedBox(height: FmSpacing.space3),
                          _buildActions(),
                        ],
                      ),
                    ],
                  ),

                  // Timeline toggle
                  if (widget.historico.isNotEmpty)
                    TextButton.icon(
                      onPressed: () {
                        setState(() {
                          _showTimeline = !_showTimeline;
                        });
                      },
                      icon: AnimatedRotation(
                        turns: _showTimeline ? 0.5 : 0,
                        duration: FmDurations.fast,
                        child: const Icon(Icons.keyboard_arrow_down, size: 18),
                      ),
                      label: Text(
                        _showTimeline
                            ? 'Ocultar histórico'
                            : 'Ver histórico (${widget.historico.length})',
                      ),
                      style: TextButton.styleFrom(
                        foregroundColor: FmColors.textSecondary,
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                    ),
                ],
              ),
            ),

            // Timeline (expandable)
            AnimatedSize(
              duration: FmDurations.slow,
              curve: FmCurves.easeInOut,
              child: _showTimeline
                  ? _buildTimeline()
                  : const SizedBox.shrink(),
            ),

            // Items preview (expandable)
            AnimatedSize(
              duration: FmDurations.slow,
              curve: FmCurves.easeInOut,
              child: _isExpanded
                  ? _buildItemsPreview()
                  : const SizedBox.shrink(),
            ),

            // Toggle button
            _buildToggleButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusDot(_StatusConfig config) {
    Widget dot = Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(
        color: config.dotColor,
        shape: BoxShape.circle,
        border: config.pulse
            ? Border.all(
                color: config.dotColor.withOpacity(0.3),
                width: 4,
              )
            : null,
      ),
    );

    if (config.pulse) {
      return AnimatedBuilder(
        animation: _pulseController,
        builder: (context, child) {
          return Transform.scale(
            scale: 1.0 + (_pulseController.value * 0.2),
            child: Opacity(
              opacity: 0.7 + (_pulseController.value * 0.3),
              child: dot,
            ),
          );
        },
      );
    }

    return dot;
  }

  Widget _buildStatusBadge(_StatusConfig config) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: FmSpacing.space3,
        vertical: FmSpacing.space1,
      ),
      decoration: BoxDecoration(
        color: config.bgColor,
        borderRadius: BorderRadius.circular(FmRadius.full),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            config.icon,
            size: 14,
            color: config.color,
          ),
          const SizedBox(width: FmSpacing.space1),
          Text(
            config.label,
            style: FmTypography.caption.copyWith(
              color: config.color,
              fontWeight: FmTypography.weightMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProformaBadge() {
    return GestureDetector(
      onTap: widget.onVerProforma,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: FmSpacing.space3,
          vertical: FmSpacing.space1,
        ),
        decoration: BoxDecoration(
          color: const Color(0x265E6AD2),
          borderRadius: BorderRadius.circular(FmRadius.full),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.description_outlined,
              size: 14,
              color: FmColors.accentPrimary,
            ),
            const SizedBox(width: FmSpacing.space1),
            Text(
              widget.proformaGerada!.numero,
              style: FmTypography.caption.copyWith(
                color: FmColors.accentPrimary,
                fontWeight: FmTypography.weightMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDiasBadge() {
    final isUrgent = _diasRestantes <= 3;
    return Text(
      _diasRestantes == 0
          ? 'Vence hoje'
          : '$_diasRestantes dias restantes',
      style: FmTypography.caption.copyWith(
        color: isUrgent ? FmColors.warning : FmColors.textMuted,
      ),
    );
  }

  Widget _buildActions() {
    switch (widget.status) {
      case CotacaoStatus.rascunho:
        return _buildActionButton(
          'Enviar',
          Icons.send,
          FmColors.accentPrimary,
          widget.onEnviar,
        );
      case CotacaoStatus.enviada:
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildTextButton('Rejeitar', FmColors.error, widget.onRejeitar),
            const SizedBox(width: FmSpacing.space2),
            _buildTextButton('Contra-proposta', FmColors.textSecondary, widget.onCounterOffer),
            const SizedBox(width: FmSpacing.space2),
            _buildActionButton(
              'Aceitar',
              Icons.check,
              FmColors.success,
              widget.onAceitar,
            ),
          ],
        );
      case CotacaoStatus.negociando:
        return _buildActionButton(
          'Responder',
          Icons.reply,
          FmColors.accentPrimary,
          widget.onCounterOffer,
        );
      case CotacaoStatus.vencida:
        return _buildTextButton(
          'Renovar',
          FmColors.textSecondary,
          () {},
          icon: Icons.refresh,
        );
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildActionButton(
    String label,
    IconData icon,
    Color color,
    VoidCallback? onTap,
  ) {
    return GestureDetector(
      onTap: widget.isLoading ? null : onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: FmSpacing.space4,
          vertical: FmSpacing.space2,
        ),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(FmRadius.md),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: FmColors.textInverse,
            ),
            const SizedBox(width: FmSpacing.space2),
            Text(
              label,
              style: FmTypography.body.copyWith(
                color: FmColors.textInverse,
                fontWeight: FmTypography.weightMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextButton(String label, Color color, VoidCallback? onTap, {IconData? icon}) {
    return GestureDetector(
      onTap: widget.isLoading ? null : onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: FmSpacing.space3,
          vertical: FmSpacing.space2,
        ),
        decoration: BoxDecoration(
          color: FmColors.bgTertiary,
          borderRadius: BorderRadius.circular(FmRadius.md),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 16, color: color),
              const SizedBox(width: FmSpacing.space1),
            ],
            Text(
              label,
              style: FmTypography.body.copyWith(color: color),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeline() {
    return Container(
      padding: const EdgeInsets.all(FmSpacing.space5),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: FmColors.border.withOpacity(0.5)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Histórico de Negociação',
            style: FmTypography.caption.copyWith(
              color: FmColors.textMuted,
              fontWeight: FmTypography.weightSemibold,
            ),
          ),
          const SizedBox(height: FmSpacing.space4),
          Stack(
            children: [
              // Timeline line
              Positioned(
                left: 5,
                top: 8,
                bottom: 8,
                child: Container(
                  width: 1,
                  color: FmColors.border,
                ),
              ),
              // Timeline items
              Column(
                children: widget.historico.asMap().entries.map((entry) {
                  final index = entry.key;
                  final item = entry.value;
                  return _buildTimelineItem(item, index);
                }).toList(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(HistoricoItem item, int index) {
    final isVendedor = item.autorTipo == 'VENDEDOR';
    final iconData = _getHistoricoIcon(item.tipo);

    return Padding(
      padding: const EdgeInsets.only(bottom: FmSpacing.space4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 10,
            height: 10,
            margin: const EdgeInsets.only(top: 4),
            decoration: BoxDecoration(
              color: isVendedor ? FmColors.accentPrimary : FmColors.warning,
              shape: BoxShape.circle,
              border: Border.all(
                color: FmColors.bgSecondary,
                width: 2,
              ),
            ),
          ),
          const SizedBox(width: FmSpacing.space4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      item.autor,
                      style: FmTypography.caption.copyWith(
                        color: FmColors.textPrimary,
                        fontWeight: FmTypography.weightMedium,
                      ),
                    ),
                    const SizedBox(width: FmSpacing.space2),
                    Text(
                      _formatDate(item.data),
                      style: FmTypography.small.copyWith(
                        color: FmColors.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: FmSpacing.space1),
                Row(
                  children: [
                    Icon(
                      iconData,
                      size: 14,
                      color: FmColors.textSecondary,
                    ),
                    const SizedBox(width: FmSpacing.space2),
                    Expanded(
                      child: Text(
                        _getHistoricoText(item),
                        style: FmTypography.body.copyWith(
                          color: FmColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getHistoricoIcon(HistoricoTipo tipo) {
    switch (tipo) {
      case HistoricoTipo.alteracaoPreco:
        return Icons.trending_down;
      case HistoricoTipo.alteracaoQtd:
        return Icons.edit;
      case HistoricoTipo.counterOffer:
        return Icons.chat_bubble_outline;
      case HistoricoTipo.comentario:
        return Icons.comment_outlined;
      case HistoricoTipo.envio:
        return Icons.send;
      case HistoricoTipo.aceite:
        return Icons.check_circle_outline;
      case HistoricoTipo.rejeite:
        return Icons.cancel_outlined;
    }
  }

  String _getHistoricoText(HistoricoItem item) {
    switch (item.tipo) {
      case HistoricoTipo.alteracaoPreco:
        return 'Preço alterado: ${_formatCurrency(item.valorAnterior ?? 0)} → ${_formatCurrency(item.valorNovo ?? 0)}';
      case HistoricoTipo.counterOffer:
        return 'Enviou contra-proposta';
      case HistoricoTipo.comentario:
        return item.comentario ?? 'Comentário';
      case HistoricoTipo.envio:
        return 'Cotação enviada';
      case HistoricoTipo.aceite:
        return 'Cotação aceite';
      case HistoricoTipo.rejeite:
        return 'Cotação rejeitada';
      default:
        return 'Alteração';
    }
  }

  Widget _buildItemsPreview() {
    return Container(
      padding: const EdgeInsets.all(FmSpacing.space5),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: FmColors.border.withOpacity(0.5)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'ITENS DA COTAÇÃO',
            style: FmTypography.caption.copyWith(
              color: FmColors.textMuted,
              fontWeight: FmTypography.weightSemibold,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: FmSpacing.space3),
          ...widget.itens.map((item) => _buildItemRow(item)),
        ],
      ),
    );
  }

  Widget _buildItemRow(ItemCotacao item) {
    return Container(
      margin: const EdgeInsets.only(bottom: FmSpacing.space2),
      padding: const EdgeInsets.all(FmSpacing.space3),
      decoration: BoxDecoration(
        color: FmColors.bgTertiary,
        borderRadius: BorderRadius.circular(FmRadius.md),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.descricao,
                  style: FmTypography.body.copyWith(
                    color: FmColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '${item.quantidade.toStringAsFixed(0)} × ${_formatCurrency(item.precoUnit)}',
                  style: FmTypography.caption.copyWith(
                    color: FmColors.textMuted,
                  ),
                ),
                if (item.descontoPercent > 0)
                  Text(
                    '(-${item.descontoPercent.toStringAsFixed(0)}%)',
                    style: FmTypography.caption.copyWith(
                      color: FmColors.success,
                    ),
                  ),
              ],
            ),
          ),
          Text(
            _formatCurrency(item.totalLinha),
            style: FmTypography.body.copyWith(
              color: FmColors.textPrimary,
              fontWeight: FmTypography.weightMedium,
              fontFamily: FmTypography.fontMono,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToggleButton() {
    return GestureDetector(
      onTap: () {
        setState(() {
          _isExpanded = !_isExpanded;
        });
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: FmSpacing.space3),
        decoration: BoxDecoration(
          color: FmColors.bgTertiary.withOpacity(0.5),
          border: Border(
            top: BorderSide(color: FmColors.border.withOpacity(0.5)),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedRotation(
              turns: _isExpanded ? 0.5 : 0,
              duration: FmDurations.fast,
              child: const Icon(
                Icons.keyboard_arrow_down,
                size: 18,
                color: FmColors.textSecondary,
              ),
            ),
            const SizedBox(width: FmSpacing.space2),
            Text(
              _isExpanded ? 'Menos detalhes' : 'Ver itens',
              style: FmTypography.caption.copyWith(
                color: FmColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
