package com.bolsaterminal.features.broker

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
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
import com.bolsaterminal.core.model.BrokerPosition
import com.bolsaterminal.core.model.TradeSource

@Composable
fun OpenPositionsList(positions: List<BrokerPosition>, onSellAll: (String) -> Unit) {
    Column {
        Text(stringResource(R.string.broker_open_positions), color = BtColors.textPrimary)
        if (positions.isEmpty()) {
            Text(stringResource(R.string.broker_no_positions), color = BtColors.textSecondary, fontSize = 12.sp, modifier = Modifier.padding(vertical = 8.dp))
        } else {
            Column(modifier = Modifier.background(BtColors.card)) {
                positions.forEachIndexed { index, pos ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(pos.symbol, color = BtColors.textPrimary, fontFamily = BtMonoFontFamily, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                if (pos.source == TradeSource.Bot) {
                                    Text(" 🤖", fontSize = 11.sp)
                                }
                            }
                            Text(
                                "${"%.4g".format(pos.quantity)} @ ${"%.2f".format(pos.avgCost)}",
                                color = BtColors.textSecondary,
                                fontSize = 10.sp,
                            )
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("%.2f".format(pos.value), color = BtColors.textPrimary, fontFamily = BtMonoFontFamily, fontSize = 12.sp)
                            Text(
                                "${if (pos.pnlPct >= 0) "+" else ""}${"%.2f".format(pos.pnlPct)}%",
                                color = if (pos.pnl >= 0) BtColors.green else BtColors.red,
                                fontFamily = BtMonoFontFamily,
                                fontSize = 12.sp,
                            )
                        }
                        Button(onClick = { onSellAll(pos.symbol) }) { Text(stringResource(R.string.broker_sell_all)) }
                    }
                    if (index != positions.lastIndex) HorizontalDivider(color = BtColors.border)
                }
            }
        }
    }
}
