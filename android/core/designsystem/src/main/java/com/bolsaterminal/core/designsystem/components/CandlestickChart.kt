package com.bolsaterminal.core.designsystem.components

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.unit.dp
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.model.OHLCVBar

@Composable
fun CandlestickChart(bars: List<OHLCVBar>, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        if (bars.isEmpty()) return@Canvas
        val minLow = bars.minOf { it.low }
        val maxHigh = bars.maxOf { it.high }
        val range = (maxHigh - minLow).takeIf { it > 0.0 } ?: 1.0
        val barWidth = size.width / bars.size
        val wickStroke = 1.dp.toPx()

        fun yFor(value: Double): Float = (size.height * (1f - ((value - minLow) / range))).toFloat()

        bars.forEachIndexed { index, bar ->
            val x = index * barWidth + barWidth / 2f
            val isUp = bar.close >= bar.open
            val color = if (isUp) BtColors.green else BtColors.red

            drawLine(
                color = color,
                start = Offset(x, yFor(bar.high)),
                end = Offset(x, yFor(bar.low)),
                strokeWidth = wickStroke,
            )

            val bodyTop = yFor(maxOf(bar.open, bar.close))
            val bodyBottom = yFor(minOf(bar.open, bar.close))
            val bodyWidth = barWidth * 0.6f
            drawRect(
                color = color,
                topLeft = Offset(x - bodyWidth / 2f, bodyTop),
                size = Size(bodyWidth, (bodyBottom - bodyTop).coerceAtLeast(1f)),
            )
        }
    }
}
