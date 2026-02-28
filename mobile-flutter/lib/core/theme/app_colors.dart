import 'package:flutter/material.dart';

/// FISCAL.MZ 2.0 - Design System Colors
class AppColors {
  AppColors._();

  // Background Scale
  static const Color background = Color(0xFF0F1115);
  static const Color surface = Color(0xFF161922);
  static const Color surfaceElevated = Color(0xFF1E2028);
  static const Color surfaceHigh = Color(0xFF252830);

  // Accent Colors
  static const Color primary = Color(0xFF5E6AD2);
  static const Color primaryHover = Color(0xFF4F5BC0);
  static const Color primaryActive = Color(0xFF404CAD);
  static const Color secondary = Color(0xFF8B5CF6);

  // Semantic Colors
  static const Color success = Color(0xFF10B981);
  static const Color successDim = Color(0x2610B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningDim = Color(0x26F59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color errorDim = Color(0x26EF4444);
  static const Color info = Color(0xFF3B82F6);

  // Text Colors
  static const Color text = Color(0xFFF7F8F8);
  static const Color textSecondary = Color(0xFF8B949E);
  static const Color textMuted = Color(0xFF6E7681);

  // Border & Divider
  static const Color border = Color(0xFF2E3038);
  static const Color borderHover = Color(0xFF3E4048);

  // Gradients
  static const Gradient primaryGradient = LinearGradient(
    colors: [Color(0xFF5E6AD2), Color(0xFF8B5CF6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
