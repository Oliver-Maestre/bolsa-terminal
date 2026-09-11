package com.bolsaterminal.core.designsystem.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.designsystem.BtMonoFontFamily
import com.bolsaterminal.core.model.ScreenerItem

/** Shared between Dashboard's "top movers" list and the Screener table. */
@Composable
fun ScreenerItemRow(item: ScreenerItem, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Column {
            Text(item.symbol, color = BtColors.textPrimary, fontFamily = BtMonoFontFamily, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text(item.shortName, color = BtColors.textSecondary, fontSize = 11.sp, maxLines = 1)
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                "%.2f".format(item.price),
                color = BtColors.textPrimary,
                fontFamily = BtMonoFontFamily,
                fontSize = 13.sp,
                modifier = Modifier.padding(end = 10.dp),
            )
            Text(
                "${if (item.changePercent >= 0) "+" else ""}${"%.2f".format(item.changePercent)}%",
                color = if (item.changePercent >= 0) BtColors.green else BtColors.red,
                fontFamily = BtMonoFontFamily,
                fontSize = 13.sp,
                modifier = Modifier.width(70.dp),
            )
            SignalBadge(item.signal)
        }
    }
}
