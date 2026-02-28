import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Badge de status com animações
class StatusBadge extends StatelessWidget {
  final String status;
  final StatusType type;
  final bool pulse;
  final bool showIcon;

  const StatusBadge({
    super.key,
    required this.status,
    this.type = StatusType.neutral,
    this.pulse = false,
    this.showIcon = true,
  });

  @override
  Widget build(BuildContext context) {
    final config = _getConfig();
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: config.backgroundColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: config.borderColor),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            pulse 
                ? _PulsingDot(color: config.iconColor)
                : Icon(config.icon, size: 12, color: config.iconColor),
            const SizedBox(width: 6),
          ],
          Text(
            status,
            style: TextStyle(
              color: config.textColor,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  _BadgeConfig _getConfig() {
    switch (type) {
      case StatusType.success:
        return _BadgeConfig(
          backgroundColor: AppColors.successDim,
          borderColor: AppColors.success.withOpacity(0.3),
          iconColor: AppColors.success,
          textColor: AppColors.success,
          icon: Icons.check_circle,
        );
      case StatusType.warning:
        return _BadgeConfig(
          backgroundColor: AppColors.warningDim,
          borderColor: AppColors.warning.withOpacity(0.3),
          iconColor: AppColors.warning,
          textColor: AppColors.warning,
          icon: Icons.warning,
        );
      case StatusType.error:
        return _BadgeConfig(
          backgroundColor: AppColors.errorDim,
          borderColor: AppColors.error.withOpacity(0.3),
          iconColor: AppColors.error,
          textColor: AppColors.error,
          icon: Icons.error,
        );
      case StatusType.info:
        return _BadgeConfig(
          backgroundColor: AppColors.info.withOpacity(0.1),
          borderColor: AppColors.info.withOpacity(0.3),
          iconColor: AppColors.info,
          textColor: AppColors.info,
          icon: Icons.info,
        );
      case StatusType.neutral:
      default:
        return _BadgeConfig(
          backgroundColor: AppColors.surfaceElevated,
          borderColor: AppColors.border,
          iconColor: AppColors.textMuted,
          textColor: AppColors.textSecondary,
          icon: Icons.circle,
        );
    }
  }
}

class _PulsingDot extends StatefulWidget {
  final Color color;
  const _PulsingDot({required this.color});

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: widget.color.withOpacity(0.5 + (_controller.value * 0.5)),
            shape: BoxShape.circle,
          ),
        );
      },
    );
  }
}

class _BadgeConfig {
  final Color backgroundColor;
  final Color borderColor;
  final Color iconColor;
  final Color textColor;
  final IconData icon;

  _BadgeConfig({
    required this.backgroundColor,
    required this.borderColor,
    required this.iconColor,
    required this.textColor,
    required this.icon,
  });
}

enum StatusType { success, warning, error, info, neutral }
