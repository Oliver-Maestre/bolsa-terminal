package com.bolsaterminal.features.simulator

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.unit.dp
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.model.ProjectionHorizon

@Composable
fun ProjectionChart(horizons: List<ProjectionHorizon>, investment: Double, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        if (horizons.size < 2) return@Canvas
        val allValues = horizons.flatMap { listOf(it.p5, it.p95) } + investment
        val minValue = allValues.min()
        val maxValue = allValues.max()
        val range = (maxValue - minValue).takeIf { it > 0.0 } ?: 1.0
        val stepX = size.width / (horizons.size - 1)

        fun yFor(value: Double): Float = (size.height * (1f - ((value - minValue) / range))).toFloat()
        fun xFor(index: Int): Float = index * stepX

        val p5p95 = Path().apply {
            horizons.forEachIndexed { i, h -> if (i == 0) moveTo(xFor(i), yFor(h.p5)) else lineTo(xFor(i), yFor(h.p5)) }
            for (i in horizons.indices.reversed()) lineTo(xFor(i), yFor(horizons[i].p95))
            close()
        }
        drawPath(p5p95, color = BtColors.accent.copy(alpha = 0.15f))

        val p25p75 = Path().apply {
            horizons.forEachIndexed { i, h -> if (i == 0) moveTo(xFor(i), yFor(h.p25)) else lineTo(xFor(i), yFor(h.p25)) }
            for (i in horizons.indices.reversed()) lineTo(xFor(i), yFor(horizons[i].p75))
            close()
        }
        drawPath(p25p75, color = BtColors.accent.copy(alpha = 0.3f))

        for (i in 0 until horizons.size - 1) {
            drawLine(
                color = BtColors.accentLight,
                start = Offset(xFor(i), yFor(horizons[i].p50)),
                end = Offset(xFor(i + 1), yFor(horizons[i + 1].p50)),
                strokeWidth = 2.dp.toPx(),
            )
        }

        drawLine(
            color = BtColors.textSecondary,
            start = Offset(0f, yFor(investment)),
            end = Offset(size.width, yFor(investment)),
            strokeWidth = 1.dp.toPx(),
            pathEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 6f)),
        )
    }
}
