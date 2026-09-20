import 'package:flutter/material.dart';

class AppTheme {
  // ── Couleurs dark néon ─────────────────────────────────
  static const Color bg900    = Color(0xFF0D0D1A);
  static const Color bg800    = Color(0xFF12121F);
  static const Color bg700    = Color(0xFF1A1A2E);
  static const Color bg600    = Color(0xFF1E1E35);
  static const Color bg500    = Color(0xFF252540);

  static const Color purple   = Color(0xFFA855F7);
  static const Color pink     = Color(0xFFEC4899);
  static const Color cyan     = Color(0xFF06B6D4);
  static const Color blue     = Color(0xFF3B82F6);
  static const Color green    = Color(0xFF10B981);
  static const Color orange   = Color(0xFFF97316);
  static const Color red      = Color(0xFFEF4444);
  static const Color yellow   = Color(0xFFEAB308);

  static const Color textPrimary = Color(0xFFF1F5F9);
  static const Color textMuted   = Color(0xFF475569);
  static const Color border      = Color(0x0FFFFFFF);

  // ── Niveaux risque ─────────────────────────────────────
  static Color getNiveauColor(String niveau) {
    switch (niveau) {
      case 'FAIBLE':   return green;
      case 'MODERE':   return yellow;
      case 'ELEVE':    return orange;
      case 'CRITIQUE': return red;
      default:         return purple;
    }
  }

  static String getNiveauLabel(double score) {
    if (score < 0.25) return 'FAIBLE';
    if (score < 0.50) return 'MODERE';
    if (score < 0.75) return 'ELEVE';
    return 'CRITIQUE';
  }

  // ── ThemeData principal ────────────────────────────────
  // SANS fontFamily 'Inter' — utilise police système
  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: bg900,

    colorScheme: const ColorScheme.dark(
      primary:   purple,
      secondary: cyan,
      surface:   bg800,
      error:     red,
    ),

    appBarTheme: const AppBarTheme(
      backgroundColor: bg800,
      foregroundColor: textPrimary,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: textPrimary,
      ),
    ),

    cardTheme: CardThemeData(
      color: bg800,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: border, width: 1),
      ),
    ),

    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: bg700,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: purple, width: 2),
      ),
      labelStyle: const TextStyle(color: textMuted),
      hintStyle: const TextStyle(color: textMuted),
    ),

    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: purple,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        textStyle: const TextStyle(
          fontWeight: FontWeight.w700,
          fontSize: 15,
        ),
      ),
    ),

    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: bg800,
      selectedItemColor: purple,
      unselectedItemColor: textMuted,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
    ),
  );
}