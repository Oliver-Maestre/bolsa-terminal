package com.bolsaterminal.core.designsystem.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.designsystem.R
import com.bolsaterminal.core.model.SignalType

@Composable
fun SignalBadge(signal: SignalType, modifier: Modifier = Modifier) {
    val (label, background, foreground) = signalStyle(signal)
    Text(
        text = label,
        color = foreground,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        modifier = modifier
            .background(background, RoundedCornerShape(50))
            .padding(horizontal = 8.dp, vertical = 3.dp),
    )
}

@Composable
private fun signalStyle(signal: SignalType): Triple<String, Color, Color> = when (signal) {
    SignalType.StrongBuy -> Triple(stringResource(R.string.signal_strong_buy), BtColors.green.copy(alpha = 0.25f), BtColors.green)
    SignalType.Buy -> Triple(stringResource(R.string.signal_buy), BtColors.green.copy(alpha = 0.15f), BtColors.green)
    SignalType.Neutral -> Triple(stringResource(R.string.signal_neutral), BtColors.tertiary, BtColors.textSecondary)
    SignalType.Sell -> Triple(stringResource(R.string.signal_sell), BtColors.orange.copy(alpha = 0.2f), BtColors.orange)
    SignalType.StrongSell -> Triple(stringResource(R.string.signal_strong_sell), BtColors.red.copy(alpha = 0.25f), BtColors.red)
}
