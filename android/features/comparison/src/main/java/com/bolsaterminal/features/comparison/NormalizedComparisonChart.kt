package com.bolsaterminal.features.comparison

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.model.OHLCVBar
import androidx.compose.ui.unit.dp

val comparisonPalette = listOf(
    BtColors.accent, BtColors.green, BtColors.orange, BtColors.red, BtColors.purple, BtColors.yellow,
)

/** Normalizes each series to % change from its first close so symbols with very different prices can share one axis. */
@Composable
fun NormalizedComparisonChart(series: Map<String, List<OHLCVBar>>, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val normalized = series.mapValues { (_, bars) ->
            val base = bars.firstOrNull()?.close ?: return@mapValues emptyList()
            if (base <= 0.0) return@mapValues emptyList()
            bars.map { ((it.close - base) / base) * 100 }
        }
        val allValues = normalized.values.flatten()
        if (allValues.isEmpty()) return@Canvas

        val minValue = minOf(0.0, allValues.min())
        val maxValue = maxOf(0.0, allValues.max())
        val range = (maxValue - minValue).takeIf { it > 0.0 } ?: 1.0

        fun yFor(value: Double): Float = (size.height * (1f - ((value - minValue) / range))).toFloat()

        // Zero line
        drawLine(
            color = BtColors.border,
            start = Offset(0f, yFor(0.0)),
            end = Offset(size.width, yFor(0.0)),
            strokeWidth = 1.dp.toPx(),
        )

        normalized.entries.forEachIndexed { seriesIndex, (_, values) ->
            if (values.size < 2) return@forEachIndexed
            val color = comparisonPalette[seriesIndex % comparisonPalette.size]
            val stepX = size.width / (values.size - 1)
            for (i in 0 until values.size - 1) {
                drawLine(
                    color = color,
                    start = Offset(i * stepX, yFor(values[i])),
                    end = Offset((i + 1) * stepX, yFor(values[i + 1])),
                    strokeWidth = 2.dp.toPx(),
                )
            }
        }
    }
}

fun colorForSeries(index: Int): Color = comparisonPalette[index % comparisonPalette.size]
