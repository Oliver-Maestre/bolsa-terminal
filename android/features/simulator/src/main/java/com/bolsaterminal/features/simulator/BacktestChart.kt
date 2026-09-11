package com.bolsaterminal.features.simulator

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.unit.dp
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.model.BacktestChartPoint

@Composable
fun BacktestChart(points: List<BacktestChartPoint>, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        if (points.size < 2) return@Canvas
        val allValues = points.flatMap { listOfNotNull(it.symbol, it.spx, it.ibex) }
        if (allValues.isEmpty()) return@Canvas
        val minValue = allValues.min()
        val maxValue = allValues.max()
        val range = (maxValue - minValue).takeIf { it > 0.0 } ?: 1.0
        val stepX = size.width / (points.size - 1)

        fun yFor(value: Double): Float = (size.height * (1f - ((value - minValue) / range))).toFloat()

        fun drawSeries(color: androidx.compose.ui.graphics.Color, extractor: (BacktestChartPoint) -> Double?) {
            val series = points.mapIndexedNotNull { index, point -> extractor(point)?.let { index to it } }
            for (i in 0 until series.size - 1) {
                val (indexA, valueA) = series[i]
                val (indexB, valueB) = series[i + 1]
                drawLine(
                    color = color,
                    start = Offset(indexA * stepX, yFor(valueA)),
                    end = Offset(indexB * stepX, yFor(valueB)),
                    strokeWidth = 2.dp.toPx(),
                )
            }
        }

        drawSeries(BtColors.accent) { it.symbol }
        drawSeries(BtColors.green) { it.spx }
        drawSeries(BtColors.orange) { it.ibex }
    }
}
