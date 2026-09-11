package com.bolsaterminal.features.portfolio

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Size
import com.bolsaterminal.core.designsystem.BtColors

val portfolioPalette = listOf(
    BtColors.accent, BtColors.green, BtColors.orange, BtColors.purple, BtColors.yellow, BtColors.red,
)

@Composable
fun PortfolioDonutChart(values: List<Double>, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier.fillMaxSize()) {
        val total = values.sum()
        if (total <= 0.0) return@Canvas
        val strokeWidth = size.minDimension * 0.22f
        val diameter = size.minDimension - strokeWidth
        val topLeft = androidx.compose.ui.geometry.Offset((size.width - diameter) / 2f, (size.height - diameter) / 2f)
        var startAngle = -90f
        values.forEachIndexed { index, value ->
            val sweep = (value / total * 360.0).toFloat()
            drawArc(
                color = portfolioPalette[index % portfolioPalette.size],
                startAngle = startAngle,
                sweepAngle = sweep * 0.96f,
                useCenter = false,
                topLeft = topLeft,
                size = Size(diameter, diameter),
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = strokeWidth),
            )
            startAngle += sweep
        }
    }
}
