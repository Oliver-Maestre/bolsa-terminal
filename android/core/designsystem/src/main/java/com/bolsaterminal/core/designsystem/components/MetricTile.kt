package com.bolsaterminal.core.designsystem.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bolsaterminal.core.designsystem.BtColors
import java.text.NumberFormat
import java.util.Locale
import kotlin.math.abs

@Composable
fun MetricTile(
    label: String,
    value: Double,
    modifier: Modifier = Modifier,
    isCurrency: Boolean = false,
    isPercent: Boolean = false,
    colored: Boolean = false,
    currencyCode: String = "USD",
) {
    val formatted = when {
        isPercent -> "${if (value >= 0) "+" else ""}${"%.2f".format(value)}%"
        isCurrency -> currencyFormat(value, currencyCode)
        else -> "%.2f".format(value)
    }
    val color = if (colored) (if (value >= 0) BtColors.green else BtColors.red) else BtColors.textPrimary

    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = BtColors.card),
        border = BorderStroke(1.dp, BtColors.border),
        shape = RoundedCornerShape(10.dp),
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(label, color = BtColors.textSecondary, fontSize = 12.sp)
            Text(formatted, color = color, fontWeight = FontWeight.Bold, fontSize = 18.sp, modifier = Modifier.padding(top = 4.dp))
        }
    }
}

private fun currencyFormat(value: Double, currencyCode: String): String {
    val format = NumberFormat.getCurrencyInstance(Locale.US).apply {
        currency = java.util.Currency.getInstance(currencyCode)
    }
    return if (value < 0) "-${format.format(abs(value))}" else format.format(value)
}
