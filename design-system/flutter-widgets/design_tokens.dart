// ============================================================================
// FISCAL.MZ 2.0 - Design Tokens
// Linear-inspired Design System - Flutter
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Core Design Tokens para o tema FISCAL.MZ 2.0
/// Baseado no Linear.app - Dark mode elegante e minimalista

// =============================================================================
// CORE PALETTE
// =============================================================================

class FmColors {
  FmColors._();

  // Background Scale
  static const Color bgPrimary = Color(0xFF0F1115);
  static const Color bgSecondary = Color(0xFF161922);
  static const Color bgTertiary = Color(0xFF1E2028);
  static const Color bgElevated = Color(0xFF252830);
  static const Color bgOverlay = Color(0xD90F1115);

  // Accent Colors
  static const Color accentPrimary = Color(0xFF5E6AD2);
  static const Color accentPrimaryHover = Color(0xFF4F5BC0);
  static const Color accentPrimaryActive = Color(0xFF404CAD);
  static const Color accentSecondary = Color(0xFF8B5CF6);
  static const Color accentSecondaryHover = Color(0xFF7C3AED);

  // Semantic Colors
  static const Color success = Color(0xFF10B981);
  static const Color successDim = Color(0x2610B981);
  static const Color successGlow = Color(0x6610B981);

  static const Color warning = Color(0xFFF59E0B);
  static const Color warningDim = Color(0x26F59E0B);
  static const Color warningGlow = Color(0x66F59E0B);

  static const Color error = Color(0xFFEF4444);
  static const Color errorDim = Color(0x26EF4444);
  static const Color errorGlow = Color(0x66EF4444);

  static const Color info = Color(0xFF3B82F6);
  static const Color infoDim = Color(0x263B82F6);

  // Text Colors
  static const Color textPrimary = Color(0xFFF7F8F8);
  static const Color textSecondary = Color(0xFF8B949E);
  static const Color textMuted = Color(0xFF6E7681);
  static const Color textInverse = Color(0xFF0F1115);

  // Border Colors
  static const Color border = Color(0xFF2E3038);
  static const Color borderHover = Color(0xFF3E4048);
  static const Color borderActive = Color(0xFF5E6AD2);
}

// =============================================================================
// LIGHT MODE COLORS
// =============================================================================

class FmLightColors {
  FmLightColors._();

  static const Color bgPrimary = Color(0xFFFFFFFF);
  static const Color bgSecondary = Color(0xFFF9FAFB);
  static const Color bgTertiary = Color(0xFFF3F4F6);
  static const Color bgElevated = Color(0xFFFFFFFF);
  static const Color bgOverlay = Color(0xE6FFFFFF);

  static const Color textPrimary = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF4B5563);
  static const Color textMuted = Color(0xFF9CA3AF);

  static const Color border = Color(0xFFE5E7EB);
  static const Color borderHover = Color(0xFFD1D5DB);
}

// =============================================================================
// TYPOGRAPHY
// =============================================================================

class FmTypography {
  FmTypography._();

  // Font Families
  static const String fontSans = 'Inter';
  static const String fontMono = 'JetBrainsMono';

  // Font Sizes
  static const double sizeDisplay = 48.0;
  static const double sizeHeadline = 24.0;
  static const double sizeTitle = 18.0;
  static const double sizeBody = 15.0;
  static const double sizeCaption = 13.0;
  static const double sizeSmall = 12.0;

  // Font Weights
  static const FontWeight weightRegular = FontWeight.w400;
  static const FontWeight weightMedium = FontWeight.w500;
  static const FontWeight weightSemibold = FontWeight.w600;
  static const FontWeight weightBold = FontWeight.w700;

  // Line Heights
  static const double lineHeightTight = 1.2;
  static const double lineHeightNormal = 1.5;
  static const double lineHeightRelaxed = 1.75;

  // Letter Spacing
  static const double letterSpacingTight = -0.02;
  static const double letterSpacingNormal = 0.0;
  static const double letterSpacingWide = 0.02;

  // Predefined Styles
  static const TextStyle display = TextStyle(
    fontFamily: fontSans,
    fontSize: sizeDisplay,
    fontWeight: weightSemibold,
    letterSpacing: letterSpacingTight,
    height: lineHeightTight,
    color: FmColors.textPrimary,
  );

  static const TextStyle headline = TextStyle(
    fontFamily: fontSans,
    fontSize: sizeHeadline,
    fontWeight: weightSemibold,
    height: 1.3,
    color: FmColors.textPrimary,
  );

  static const TextStyle title = TextStyle(
    fontFamily: fontSans,
    fontSize: sizeTitle,
    fontWeight: weightSemibold,
    height: 1.4,
    color: FmColors.textPrimary,
  );

  static const TextStyle body = TextStyle(
    fontFamily: fontSans,
    fontSize: sizeBody,
    fontWeight: weightRegular,
    height: lineHeightNormal,
    color: FmColors.textPrimary,
  );

  static const TextStyle caption = TextStyle(
    fontFamily: fontSans,
    fontSize: sizeCaption,
    fontWeight: weightMedium,
    height: lineHeightNormal,
    color: FmColors.textSecondary,
  );

  static const TextStyle small = TextStyle(
    fontFamily: fontSans,
    fontSize: sizeSmall,
    fontWeight: weightRegular,
    height: lineHeightNormal,
    color: FmColors.textMuted,
  );

  // Mono styles for numbers, hashes
  static const TextStyle mono = TextStyle(
    fontFamily: fontMono,
    fontSize: sizeBody,
    fontWeight: weightRegular,
    height: lineHeightNormal,
    color: FmColors.textPrimary,
  );

  static const TextStyle monoCaption = TextStyle(
    fontFamily: fontMono,
    fontSize: sizeCaption,
    fontWeight: weightRegular,
    height: lineHeightNormal,
    color: FmColors.textSecondary,
  );
}

// =============================================================================
// SPACING
// =============================================================================

class FmSpacing {
  FmSpacing._();

  static const double space0 = 0.0;
  static const double space1 = 4.0;
  static const double space2 = 8.0;
  static const double space3 = 12.0;
  static const double space4 = 16.0;
  static const double space5 = 20.0;
  static const double space6 = 24.0;
  static const double space8 = 32.0;
  static const double space10 = 40.0;
  static const double space12 = 48.0;
  static const double space16 = 64.0;
  static const double space20 = 80.0;

  // Layout constants
  static const double sidebarWidth = 200.0;
  static const double sidebarCollapsedWidth = 64.0;
  static const double headerHeight = 64.0;
  static const double bottomNavHeight = 64.0;
  static const double rightSidebarWidth = 400.0;
}

// =============================================================================
// BORDER RADIUS
// =============================================================================

class FmRadius {
  FmRadius._();

  static const double none = 0.0;
  static const double sm = 6.0;
  static const double md = 8.0;
  static const double lg = 12.0;
  static const double xl = 16.0;
  static const double xxl = 20.0;
  static const double full = 9999.0;
}

// =============================================================================
// SHADOWS
// =============================================================================

class FmShadows {
  FmShadows._();

  static const List<BoxShadow> sm = [
    BoxShadow(
      color: Color(0x4D000000),
      blurRadius: 2.0,
      offset: Offset(0, 1),
    ),
  ];

  static const List<BoxShadow> md = [
    BoxShadow(
      color: Color(0x66000000),
      blurRadius: 6.0,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: Color(0x33000000),
      blurRadius: 4.0,
      offset: Offset(0, 2),
    ),
  ];

  static const List<BoxShadow> lg = [
    BoxShadow(
      color: Color(0x80000000),
      blurRadius: 15.0,
      offset: Offset(0, 10),
    ),
    BoxShadow(
      color: Color(0x4D000000),
      blurRadius: 6.0,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> glowAccent = [
    BoxShadow(
      color: Color(0x4D5E6AD2),
      blurRadius: 20.0,
      spreadRadius: 0.0,
    ),
  ];

  static const List<BoxShadow> glowSuccess = [
    BoxShadow(
      color: Color(0x4D10B981),
      blurRadius: 20.0,
      spreadRadius: 0.0,
    ),
  ];

  static const List<BoxShadow> glowWarning = [
    BoxShadow(
      color: Color(0x4DF59E0B),
      blurRadius: 20.0,
      spreadRadius: 0.0,
    ),
  ];

  static const List<BoxShadow> glowError = [
    BoxShadow(
      color: Color(0x4DEF4444),
      blurRadius: 20.0,
      spreadRadius: 0.0,
    ),
  ];

  static const List<BoxShadow> cardHover = [
    BoxShadow(
      color: Color(0x80000000),
      blurRadius: 24.0,
      offset: Offset(0, 8),
    ),
  ];
}

// =============================================================================
// ANIMATION DURATIONS & CURVES
// =============================================================================

class FmDurations {
  FmDurations._();

  static const Duration instant = Duration.zero;
  static const Duration fast = Duration(milliseconds: 150);
  static const Duration normal = Duration(milliseconds: 200);
  static const Duration slow = Duration(milliseconds: 300);
  static const Duration slower = Duration(milliseconds: 500);
}

class FmCurves {
  FmCurves._();

  static const Curve linear = Curves.linear;
  static const Curve easeIn = Curves.easeIn;
  static const Curve easeOut = Curves.easeOut;
  static const Curve easeInOut = Curves.easeInOut;
  static const Cubic bounce = Cubic(0.34, 1.56, 0.64, 1.0);
  static const Cubic spring = Cubic(0.175, 0.885, 0.32, 1.275);
}

// =============================================================================
// THEME DATA
// =============================================================================

class FmTheme {
  FmTheme._();

  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: FmColors.bgPrimary,
      primaryColor: FmColors.accentPrimary,
      colorScheme: const ColorScheme.dark(
        primary: FmColors.accentPrimary,
        secondary: FmColors.accentSecondary,
        surface: FmColors.bgSecondary,
        background: FmColors.bgPrimary,
        error: FmColors.error,
        onPrimary: FmColors.textInverse,
        onSecondary: FmColors.textInverse,
        onSurface: FmColors.textPrimary,
        onBackground: FmColors.textPrimary,
        onError: FmColors.textInverse,
      ),
      textTheme: const TextTheme(
        displayLarge: FmTypography.display,
        headlineMedium: FmTypography.headline,
        titleMedium: FmTypography.title,
        bodyMedium: FmTypography.body,
        bodySmall: FmTypography.caption,
        labelSmall: FmTypography.small,
      ),
      cardTheme: CardTheme(
        color: FmColors.bgSecondary,
        elevation: 0.0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(FmRadius.lg),
          side: const BorderSide(color: FmColors.border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
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
        contentPadding: const EdgeInsets.symmetric(
          horizontal: FmSpacing.space4,
          vertical: FmSpacing.space3,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: FmColors.accentPrimary,
          foregroundColor: FmColors.textInverse,
          elevation: 0.0,
          padding: const EdgeInsets.symmetric(
            horizontal: FmSpacing.space4,
            vertical: FmSpacing.space3,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(FmRadius.md),
          ),
          textStyle: FmTypography.body.copyWith(
            fontWeight: FmTypography.weightSemibold,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: FmColors.textPrimary,
          side: const BorderSide(color: FmColors.border),
          padding: const EdgeInsets.symmetric(
            horizontal: FmSpacing.space4,
            vertical: FmSpacing.space3,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(FmRadius.md),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: FmColors.accentPrimary,
          padding: const EdgeInsets.symmetric(
            horizontal: FmSpacing.space3,
            vertical: FmSpacing.space2,
          ),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: FmColors.border,
        thickness: 1.0,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: FmColors.bgSecondary,
        elevation: 0.0,
        centerTitle: false,
        titleTextStyle: FmTypography.headline,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: FmColors.bgSecondary,
        selectedItemColor: FmColors.accentPrimary,
        unselectedItemColor: FmColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0.0,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: FmColors.bgTertiary,
        selectedColor: FmColors.accentPrimary,
        labelStyle: FmTypography.caption,
        padding: const EdgeInsets.symmetric(
          horizontal: FmSpacing.space3,
          vertical: FmSpacing.space1,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(FmRadius.full),
        ),
      ),
    );
  }

  static ThemeData get lightTheme {
    return darkTheme.copyWith(
      scaffoldBackgroundColor: FmLightColors.bgPrimary,
      colorScheme: ColorScheme.light(
        primary: FmColors.accentPrimary,
        secondary: FmColors.accentSecondary,
        surface: FmLightColors.bgSecondary,
        background: FmLightColors.bgPrimary,
        error: FmColors.error,
        onPrimary: FmColors.textInverse,
        onSecondary: FmColors.textInverse,
        onSurface: FmLightColors.textPrimary,
        onBackground: FmLightColors.textPrimary,
        onError: FmColors.textInverse,
      ),
      textTheme: TextTheme(
        displayLarge: FmTypography.display.copyWith(color: FmLightColors.textPrimary),
        headlineMedium: FmTypography.headline.copyWith(color: FmLightColors.textPrimary),
        titleMedium: FmTypography.title.copyWith(color: FmLightColors.textPrimary),
        bodyMedium: FmTypography.body.copyWith(color: FmLightColors.textPrimary),
        bodySmall: FmTypography.caption.copyWith(color: FmLightColors.textSecondary),
        labelSmall: FmTypography.small.copyWith(color: FmLightColors.textMuted),
      ),
    );
  }
}

// =============================================================================
// SYSTEM UI OVERLAY STYLE
// =============================================================================

class FmSystemUI {
  FmSystemUI._();

  static const SystemUiOverlayStyle darkOverlay = SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: FmColors.bgSecondary,
    systemNavigationBarIconBrightness: Brightness.light,
  );

  static const SystemUiOverlayStyle lightOverlay = SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
    systemNavigationBarColor: FmLightColors.bgSecondary,
    systemNavigationBarIconBrightness: Brightness.dark,
  );
}
