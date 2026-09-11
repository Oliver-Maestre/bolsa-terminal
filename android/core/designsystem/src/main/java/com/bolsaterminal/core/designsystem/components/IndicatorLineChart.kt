package com.bolsaterminal.core.designsystem.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bolsaterminal.core.designsystem.BtColors

/**
 * Generic small line chart for RSI / MACD histogram / Bollinger %B — values
 * are nullable because warmup periods come back as JSON `null` (see
 * IndicatorSet in :core:model). Null points simply break the line, matching
 * how the backend/frontend already treat NaN.
 */
@Composable
fun IndicatorLineChart(
    title: String,
    values: List<Double?>,
    modifier: Modifier = Modifier,
    lineColor: Color = BtColors.accent,
    referenceLines: List<Double> = emptyList(),
) {
    Column(modifier = modifier) {
        Text(title, color = BtColors.textSecondary, fontSize = 10.sp)
        Canvas(modifier = Modifier.fillMaxWidth().height(80.dp)) {
            val points = values.mapIndexedNotNull { index, value -> value?.let { index to it } }
            if (points.size < 2) return@Canvas

            val allValues = points.map { it.second } + referenceLines
            val minValue = allValues.min()
            val maxValue = allValues.max()
            val range = (maxValue - minValue).takeIf { it > 0.0 } ?: 1.0
            val stepX = size.width / (values.size - 1).coerceAtLeast(1)

            fun yFor(value: Double): Float = (size.height * (1f - ((value - minValue) / range))).toFloat()

            referenceLines.forEach { ref ->
                drawLine(
                    color = BtColors.border,
                    start = Offset(0f, yFor(ref)),
                    end = Offset(size.width, yFor(ref)),
                    strokeWidth = 1.dp.toPx(),
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 6f)),
                )
            }

            for (i in 0 until points.size - 1) {
                val (indexA, valueA) = points[i]
                val (indexB, valueB) = points[i + 1]
                drawLine(
                    color = lineColor,
                    start = Offset(indexA * stepX, yFor(valueA)),
                    end = Offset(indexB * stepX, yFor(valueB)),
                    strokeWidth = 1.5.dp.toPx(),
                )
            }
        }
    }
}
