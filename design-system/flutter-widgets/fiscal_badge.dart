// ============================================================================
// FISCAL.MZ 2.0 - FiscalBadge Widget
// Document Status - Linear-inspired Design
// ============================================================================

import 'package:flutter/material.dart';
import 'design_tokens.dart';

// =============================================================================
// ENUMS
// =============================================================================

enum FiscalStatus {
  valido,
  pendenteSync,
  syncing,
  erroHash,
  erroValidacao,
  anulado,
  naoAutorizado,
  validadoRecente,
}

enum BadgeSize { small, medium, large }

enum BadgeVariant { pill, card, minimal }

// =============================================================================
// STATUS CONFIGURATION
// =============================================================================

class _StatusConfig {
  final String label;
  final String shortLabel;
  final IconData icon;
  final Color iconBg;
  final Color textColor;
  final Color bgColor;
  final Color borderColor;
  final List<BoxShadow>? glowShadows;
  final bool animate;
  final String description;

  const _StatusConfig({
    required this.label,
    required this.shortLabel,
    required this.icon,
    required this.iconBg,
    required this.textColor,
    required this.bgColor,
    required this.borderColor,
    this.glowShadows,
    this.animate = false,
    required this.description,
  });
}

final Map<FiscalStatus, _StatusConfig> _statusConfigs = {
  FiscalStatus.valido: _StatusConfig(
    label: 'Fiscalmente Válido',
    shortLabel: 'Válido',
    icon: Icons.verified_user,
    iconBg: FmColors.successDim,
    textColor: FmColors.success,
    bgColor: FmColors.successDim,
    borderColor: FmColors.success.withOpacity(0.3),
    glowShadows: FmShadows.glowSuccess,
    description: 'Documento validado e em conformidade',
  ),
  FiscalStatus.validadoRecente: _StatusConfig(
    label: 'Validado',
    shortLabel: 'Validado',
    icon: Icons.verified_user,
    iconBg: FmColors.successDim,
    textColor: FmColors.success,
    bgColor: FmColors.successDim,
    borderColor: FmColors.success.withOpacity(0.3),
    glowShadows: FmShadows.glowSuccess,
    animate: true,
    description: 'Documento acabou de ser validado',
  ),
  FiscalStatus.pendenteSync: _StatusConfig(
    label: 'Pendente Sincronização',
    shortLabel: 'Pendente',
    icon: Icons.cloud_upload_outlined,
    iconBg: FmColors.warningDim,
    textColor: FmColors.warning,
    bgColor: FmColors.warningDim,
    borderColor: FmColors.warning.withOpacity(0.3),
    description: 'Aguardando envio para AGT',
  ),
  FiscalStatus.syncing: _StatusConfig(
    label: 'Sincronizando...',
    shortLabel: 'Sincronizando',
    icon: Icons.sync,
    iconBg: FmColors.infoDim,
    textColor: FmColors.info,
    bgColor: FmColors.infoDim,
    borderColor: FmColors.info.withOpacity(0.3),
    animate: true,
    description: 'Enviando para validação',
  ),
  FiscalStatus.erroHash: _StatusConfig(
    label: 'Erro de Integridade',
    shortLabel: 'Erro Hash',
    icon: Icons.gpp_bad,
    iconBg: FmColors.errorDim,
    textColor: FmColors.error,
    bgColor: FmColors.errorDim,
    borderColor: FmColors.error.withOpacity(0.3),
    glowShadows: FmShadows.glowError,
    description: 'Hash do documento não corresponde',
  ),
  FiscalStatus.erroValidacao: _StatusConfig(
    label: 'Erro de Validação',
    shortLabel: 'Inválido',
    icon: Icons.cancel,
    iconBg: FmColors.errorDim,
    textColor: FmColors.error,
    bgColor: FmColors.errorDim,
    borderColor: FmColors.error.withOpacity(0.3),
    glowShadows: FmShadows.glowError,
    description: 'Documento rejeitado pela AGT',
  ),
  FiscalStatus.anulado: _StatusConfig(
    label: 'Documento Anulado',
    shortLabel: 'Anulado',
    icon: Icons.delete_outline,
    iconBg: FmColors.bgTertiary,
    textColor: FmColors.textMuted,
    bgColor: FmColors.bgTertiary,
    borderColor: FmColors.border,
    description: 'Documento foi anulado',
  ),
  FiscalStatus.naoAutorizado: _StatusConfig(
    label: 'Não Autorizado',
    shortLabel: 'Não Autorizado',
    icon: Icons.shield_outlined,
    iconBg: FmColors.errorDim,
    textColor: FmColors.error,
    bgColor: FmColors.errorDim,
    borderColor: FmColors.error.withOpacity(0.3),
    description: 'Sem autorização da AGT',
  ),
};

// =============================================================================
// FISCAL BADGE WIDGET
// =============================================================================

class FiscalBadge extends StatefulWidget {
  final FiscalStatus status;
  final BadgeSize size;
  final BadgeVariant variant;
  final bool showQrCode;
  final String? hash;
  final DateTime? dataValidacao;
  final String? mensagemErro;
  final VoidCallback? onRetry;
  final VoidCallback? onViewDetails;

  const FiscalBadge({
    super.key,
    required this.status,
    this.size = BadgeSize.medium,
    this.variant = BadgeVariant.pill,
    this.showQrCode = false,
    this.hash,
    this.dataValidacao,
    this.mensagemErro,
    this.onRetry,
    this.onViewDetails,
  });

  @override
  State<FiscalBadge> createState() => _FiscalBadgeState();
}

class _FiscalBadgeState extends State<FiscalBadge>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );
    
    if (_statusConfigs[widget.status]!.animate) {
      _pulseController.repeat();
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  String _truncateHash(String hash, int length) {
    if (hash.length <= length * 2) return hash;
    return '${hash.substring(0, length)}...${hash.substring(hash.length - length)}';
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')} ${_getMonthName(date.month)} ${date.year} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }

  String _getMonthName(int month) {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return months[month - 1];
  }

  @override
  Widget build(BuildContext context) {
    final config = _statusConfigs[widget.status]!;

    switch (widget.variant) {
      case BadgeVariant.minimal:
        return _buildMinimal(config);
      case BadgeVariant.pill:
        return _buildPill(config);
      case BadgeVariant.card:
        return _buildCard(config);
    }
  }

  Widget _buildMinimal(_StatusConfig config) {
    final iconSize = widget.size == BadgeSize.small ? 14.0 : widget.size == BadgeSize.medium ? 16.0 : 20.0;
    
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
          AnimatedBuilder(
            animation: _pulseController,
            builder: (context, child) {
              return config.animate
                  ? Transform.scale(
                      scale: 1.0 + (_pulseController.value * 0.1),
                      child: child,
                    )
                  : child!;
            },
            child: Icon(
              config.icon,
              size: iconSize,
              color: config.textColor,
            ),
          ),
          const SizedBox(width: FmSpacing.space2),
          Text(
            config.shortLabel,
            style: (widget.size == BadgeSize.small ? FmTypography.small : FmTypography.caption).copyWith(
              color: config.textColor,
              fontWeight: FmTypography.weightMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPill(_StatusConfig config) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: FmSpacing.space3,
        vertical: FmSpacing.space2,
      ),
      decoration: BoxDecoration(
        color: config.bgColor,
        border: Border.all(color: config.borderColor),
        borderRadius: BorderRadius.circular(FmRadius.full),
        boxShadow: config.glowShadows,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: widget.size == BadgeSize.small ? 20 : widget.size == BadgeSize.medium ? 24 : 28,
            height: widget.size == BadgeSize.small ? 20 : widget.size == BadgeSize.medium ? 24 : 28,
            decoration: BoxDecoration(
              color: config.iconBg,
              shape: BoxShape.circle,
            ),
            child: AnimatedBuilder(
              animation: _pulseController,
              builder: (context, child) {
                return config.animate
                    ? Transform.scale(
                        scale: 1.0 + (_pulseController.value * 0.1),
                        child: child,
                      )
                    : child!;
              },
              child: Icon(
                config.icon,
                size: widget.size == BadgeSize.small ? 12 : widget.size == BadgeSize.medium ? 14 : 16,
                color: config.textColor,
              ),
            ),
          ),
          const SizedBox(width: FmSpacing.space3),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  config.label,
                  style: (widget.size == BadgeSize.small ? FmTypography.caption : FmTypography.body).copyWith(
                    color: config.textColor,
                    fontWeight: FmTypography.weightMedium,
                  ),
                ),
                if (widget.dataValidacao != null)
                  Text(
                    _formatDate(widget.dataValidacao!),
                    style: FmTypography.small.copyWith(color: FmColors.textMuted),
                  ),
              ],
            ),
          ),
          if ((widget.status == FiscalStatus.erroHash || widget.status == FiscalStatus.erroValidacao) &&
              widget.onRetry != null)
            IconButton(
              onPressed: widget.onRetry,
              icon: const Icon(Icons.refresh, size: 18),
              color: config.textColor,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
        ],
      ),
    );
  }

  Widget _buildCard(_StatusConfig config) {
    return Stack(
      children: [
        // Glow animation for VALIDADO_RECENTE
        if (widget.status == FiscalStatus.validadoRecente)
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _pulseController,
              builder: (context, child) {
                return Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(FmRadius.xl),
                    color: FmColors.success.withOpacity(0.1 * _pulseController.value),
                  ),
                );
              },
            ),
          ),
        
        Container(
          padding: const EdgeInsets.all(FmSpacing.space5),
          decoration: BoxDecoration(
            color: config.bgColor,
            border: Border.all(color: config.borderColor),
            borderRadius: BorderRadius.circular(FmRadius.xl),
            boxShadow: config.glowShadows,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: config.iconBg,
                      borderRadius: BorderRadius.circular(FmRadius.lg),
                    ),
                    child: AnimatedBuilder(
                      animation: _pulseController,
                      builder: (context, child) {
                        return config.animate
                            ? Transform.scale(
                                scale: 1.0 + (_pulseController.value * 0.1),
                                child: child,
                              )
                            : child!;
                      },
                      child: Icon(
                        config.icon,
                        size: 24,
                        color: config.textColor,
                      ),
                    ),
                  ),
                  const SizedBox(width: FmSpacing.space4),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          config.label,
                          style: FmTypography.headline.copyWith(color: config.textColor),
                        ),
                        const SizedBox(height: FmSpacing.space1),
                        Text(
                          config.description,
                          style: FmTypography.body.copyWith(color: FmColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              // Hash display
              if (widget.hash != null)
                Container(
                  margin: const EdgeInsets.only(top: FmSpacing.space5),
                  padding: const EdgeInsets.all(FmSpacing.space4),
                  decoration: BoxDecoration(
                    color: FmColors.bgPrimary.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(FmRadius.lg),
                    border: Border.all(color: FmColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.fingerprint, size: 16, color: FmColors.textMuted),
                          const SizedBox(width: FmSpacing.space2),
                          Text(
                            'HASH SHA-256',
                            style: FmTypography.caption.copyWith(
                              color: FmColors.textMuted,
                              fontWeight: FmTypography.weightSemibold,
                              letterSpacing: 1,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: FmSpacing.space2),
                      Text(
                        _truncateHash(widget.hash!, 16),
                        style: FmTypography.monoCaption.copyWith(
                          color: FmColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),

              // Error message
              if (widget.mensagemErro != null)
                Container(
                  margin: const EdgeInsets.only(top: FmSpacing.space5),
                  padding: const EdgeInsets.all(FmSpacing.space4),
                  decoration: BoxDecoration(
                    color: FmColors.error.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(FmRadius.lg),
                    border: Border.all(color: FmColors.error.withOpacity(0.2)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.warning_amber, size: 18, color: FmColors.error),
                      const SizedBox(width: FmSpacing.space3),
                      Expanded(
                        child: Text(
                          widget.mensagemErro!,
                          style: FmTypography.body.copyWith(color: FmColors.error),
                        ),
                      ),
                    ],
                  ),
                ),

              // QR Code
              if (widget.showQrCode && widget.status == FiscalStatus.valido)
                Container(
                  margin: const EdgeInsets.only(top: FmSpacing.space5),
                  padding: const EdgeInsets.all(FmSpacing.space4),
                  decoration: BoxDecoration(
                    color: FmColors.bgPrimary,
                    borderRadius: BorderRadius.circular(FmRadius.lg),
                    border: Border.all(color: FmColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(FmRadius.md),
                        ),
                        child: const Icon(
                          Icons.qr_code_2,
                          size: 48,
                          color: FmColors.bgPrimary,
                        ),
                      ),
                      const SizedBox(width: FmSpacing.space4),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'QR Code Fiscal',
                              style: FmTypography.body.copyWith(
                                fontWeight: FmTypography.weightMedium,
                              ),
                            ),
                            const SizedBox(height: FmSpacing.space1),
                            Text(
                              'Escaneie para validar o documento',
                              style: FmTypography.caption,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

              // Validation timestamp
              if (widget.dataValidacao != null)
                Padding(
                  padding: const EdgeInsets.only(top: FmSpacing.space4),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, size: 16, color: FmColors.textMuted),
                      const SizedBox(width: FmSpacing.space2),
                      Text(
                        'Validado em ${_formatDate(widget.dataValidacao!)}',
                        style: FmTypography.caption.copyWith(color: FmColors.textMuted),
                      ),
                    ],
                  ),
                ),

              // Action buttons
              if ((widget.status == FiscalStatus.erroHash ||
                      widget.status == FiscalStatus.erroValidacao) &&
                  widget.onRetry != null)
                Padding(
                  padding: const EdgeInsets.only(top: FmSpacing.space5),
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: widget.onRetry,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Tentar novamente'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: FmColors.error,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: FmSpacing.space3),
                      ),
                    ),
                  ),
                ),

              if (widget.status == FiscalStatus.pendenteSync)
                Padding(
                  padding: const EdgeInsets.only(top: FmSpacing.space5),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: FmSpacing.space3),
                    decoration: BoxDecoration(
                      color: FmColors.bgTertiary,
                      borderRadius: BorderRadius.circular(FmRadius.md),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(FmColors.textMuted),
                          ),
                        ),
                        const SizedBox(width: FmSpacing.space2),
                        Text(
                          'Aguardando...',
                          style: FmTypography.body.copyWith(color: FmColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ),

              if (widget.onViewDetails != null)
                Padding(
                  padding: const EdgeInsets.only(top: FmSpacing.space4),
                  child: TextButton(
                    onPressed: widget.onViewDetails,
                    child: const Text('Ver detalhes'),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

// =============================================================================
// FISCAL STATUS ROW (Para tabelas)
// =============================================================================

class FiscalStatusRow extends StatelessWidget {
  final FiscalStatus status;

  const FiscalStatusRow({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return FiscalBadge(
      status: status,
      variant: BadgeVariant.minimal,
      size: BadgeSize.small,
    );
  }
}

// =============================================================================
// FISCAL VALIDATION ANIMATION
// =============================================================================

class FiscalValidationAnimation extends StatefulWidget {
  final VoidCallback? onComplete;

  const FiscalValidationAnimation({
    super.key,
    this.onComplete,
  });

  @override
  State<FiscalValidationAnimation> createState() => _FiscalValidationAnimationState();
}

class _FiscalValidationAnimationState extends State<FiscalValidationAnimation>
    with TickerProviderStateMixin {
  late AnimationController _spinController;
  late AnimationController _scaleController;
  String _step = 'syncing';

  @override
  void initState() {
    super.initState();
    _spinController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    
    _scaleController = AnimationController(
      vsync: this,
      duration: FmDurations.slower,
    );

    _startAnimation();
  }

  void _startAnimation() async {
    await Future.delayed(const Duration(milliseconds: 1500));
    if (mounted) {
      setState(() => _step = 'validating');
    }
    
    await Future.delayed(const Duration(milliseconds: 1500));
    if (mounted) {
      setState(() => _step = 'success');
      _scaleController.forward();
      widget.onComplete?.();
    }
  }

  @override
  void dispose() {
    _spinController.dispose();
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AnimatedSwitcher(
        duration: FmDurations.slow,
        child: _buildStep(),
      ),
    );
  }

  Widget _buildStep() {
    switch (_step) {
      case 'syncing':
        return Column(
          key: const ValueKey('syncing'),
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            RotationTransition(
              turns: _spinController,
              child: const Icon(
                Icons.cloud_upload,
                size: 64,
                color: FmColors.info,
              ),
            ),
            const SizedBox(height: FmSpacing.space4),
            Text(
              'Sincronizando...',
              style: FmTypography.body.copyWith(color: FmColors.textSecondary),
            ),
          ],
        );
      
      case 'validating':
        return Column(
          key: const ValueKey('validating'),
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedBuilder(
              animation: _spinController,
              builder: (context, child) {
                return Transform.scale(
                  scale: 1.0 + (_spinController.value * 0.1),
                  child: const Icon(
                    Icons.shield,
                    size: 64,
                    color: FmColors.accentPrimary,
                  ),
                );
              },
            ),
            const SizedBox(height: FmSpacing.space4),
            Text(
              'Validando...',
              style: FmTypography.body.copyWith(color: FmColors.textSecondary),
            ),
          ],
        );
      
      case 'success':
        return Column(
          key: const ValueKey('success'),
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ScaleTransition(
              scale: CurvedAnimation(
                parent: _scaleController,
                curve: FmCurves.bounce,
              ),
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: FmColors.successDim,
                  shape: BoxShape.circle,
                  boxShadow: FmShadows.glowSuccess,
                ),
                child: const Icon(
                  Icons.verified_user,
                  size: 40,
                  color: FmColors.success,
                ),
              ),
            ),
            const SizedBox(height: FmSpacing.space4),
            Text(
              'Validado!',
              style: FmTypography.headline.copyWith(color: FmColors.success),
            ),
          ],
        );
      
      default:
        return const SizedBox.shrink();
    }
  }
}
