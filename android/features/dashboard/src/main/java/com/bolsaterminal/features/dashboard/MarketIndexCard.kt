package com.bolsaterminal.features.dashboard

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
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
import com.bolsaterminal.core.designsystem.BtMonoFontFamily
import com.bolsaterminal.core.model.MarketIndex

@Composable
fun MarketIndexCard(index: MarketIndex, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.width(160.dp),
        colors = CardDefaults.cardColors(containerColor = BtColors.card),
        border = BorderStroke(1.dp, BtColors.border),
        shape = RoundedCornerShape(10.dp),
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(index.name, color = BtColors.textSecondary, fontSize = 12.sp, maxLines = 1)
            Text(
                "%.2f".format(index.price),
                color = BtColors.textPrimary,
                fontFamily = BtMonoFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                modifier = Modifier.padding(top = 4.dp),
            )
            Text(
                "${if (index.changePercent >= 0) "+" else ""}${"%.2f".format(index.changePercent)}%",
                color = if (index.changePercent >= 0) BtColors.green else BtColors.red,
                fontFamily = BtMonoFontFamily,
                fontSize = 12.sp,
            )
        }
    }
}
