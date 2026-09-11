package com.bolsaterminal.core.designsystem

import androidx.compose.ui.graphics.Color

/** Mirrors frontend/tailwind.config.js so web, macOS and Android look the same. */
object BtColors {
    val background = Color(0xFF0A0E1A) // bg.primary
    val secondary = Color(0xFF111827) // bg.secondary
    val tertiary = Color(0xFF1A2235) // bg.tertiary
    val card = Color(0xFF0F1623) // bg.card

    val border = Color(0xFF1E2D45)
    val borderLight = Color(0xFF243552)

    val textPrimary = Color(0xFFE2E8F0)
    val textSecondary = Color(0xFF94A3B8)
    val textMuted = Color(0xFF475569)

    val accent = Color(0xFF3B82F6)
    val accentLight = Color(0xFF60A5FA)
    val accentDark = Color(0xFF2563EB)

    val green = Color(0xFF22C55E)
    val red = Color(0xFFEF4444)
    val orange = Color(0xFFF97316)
    val purple = Color(0xFFA855F7)
    val yellow = Color(0xFFEAB308)
}
