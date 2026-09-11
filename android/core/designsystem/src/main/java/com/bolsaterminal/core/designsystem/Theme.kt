package com.bolsaterminal.core.designsystem

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

// The web app is dark-only by design (see frontend/src/styles/globals.css) — no light scheme.
private val BolsaDarkColorScheme = darkColorScheme(
    primary = BtColors.accent,
    onPrimary = BtColors.textPrimary,
    secondary = BtColors.accentLight,
    background = BtColors.background,
    onBackground = BtColors.textPrimary,
    surface = BtColors.card,
    onSurface = BtColors.textPrimary,
    surfaceVariant = BtColors.tertiary,
    outline = BtColors.border,
    error = BtColors.red,
)

@Composable
fun BolsaTerminalTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = BolsaDarkColorScheme,
        typography = BolsaTypography,
        content = content,
    )
}
