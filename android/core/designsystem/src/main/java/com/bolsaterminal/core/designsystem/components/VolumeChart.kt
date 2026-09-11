package com.bolsaterminal.core.designsystem.components

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.model.OHLCVBar

@Composable
fun VolumeChart(bars: List<OHLCVBar>, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        if (bars.isEmpty()) return@Canvas
        val maxVolume = bars.maxOf { it.volume }.takeIf { it > 0.0 } ?: 1.0
        val barWidth = size.width / bars.size

        bars.forEachIndexed { index, bar ->
            val x = index * barWidth
            val isUp = bar.close >= bar.open
            val color = (if (isUp) BtColors.green else BtColors.red).copy(alpha = 0.5f)
            val barHeight = (size.height * (bar.volume / maxVolume)).toFloat()
            drawRect(
                color = color,
                topLeft = Offset(x + barWidth * 0.15f, size.height - barHeight),
                size = Size(barWidth * 0.7f, barHeight),
            )
        }
    }
}
