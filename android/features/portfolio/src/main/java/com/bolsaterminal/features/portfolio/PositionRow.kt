package com.bolsaterminal.features.portfolio

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.designsystem.BtMonoFontFamily
import com.bolsaterminal.core.model.PortfolioPosition
import com.bolsaterminal.core.model.QuoteSummary

@Composable
fun PositionRow(
    position: PortfolioPosition,
    quote: QuoteSummary?,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
) {
    val currentPrice = quote?.regularMarketPrice ?: position.avgCost
    val value = position.quantity * currentPrice
    val cost = position.quantity * position.avgCost
    val pnl = value - cost
    val pnlPct = if (cost > 0) (pnl / cost) * 100 else 0.0

    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Column {
            Text(position.symbol, color = BtColors.textPrimary, fontFamily = BtMonoFontFamily, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text(position.name, color = BtColors.textSecondary, fontSize = 11.sp, maxLines = 1)
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                "%.2f".format(value),
                color = BtColors.textPrimary,
                fontFamily = BtMonoFontFamily,
                fontSize = 13.sp,
                modifier = Modifier.width(90.dp),
            )
            Text(
                "${if (pnlPct >= 0) "+" else ""}${"%.2f".format(pnlPct)}%",
                color = if (pnl >= 0) BtColors.green else BtColors.red,
                fontFamily = BtMonoFontFamily,
                fontSize = 13.sp,
                modifier = Modifier.width(70.dp),
            )
            IconButton(onClick = onEdit) { Icon(Icons.Filled.Edit, contentDescription = stringResource(R.string.portfolio_edit), tint = BtColors.textSecondary) }
            IconButton(onClick = onDelete) { Icon(Icons.Filled.Delete, contentDescription = stringResource(R.string.portfolio_delete), tint = BtColors.red) }
        }
    }
}
