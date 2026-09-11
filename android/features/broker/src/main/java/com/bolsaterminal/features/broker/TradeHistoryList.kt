package com.bolsaterminal.features.broker

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
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
import com.bolsaterminal.core.model.BrokerOrder
import com.bolsaterminal.core.model.OrderSide

@Composable
fun TradeHistoryList(orders: List<BrokerOrder>) {
    Column {
        Text(stringResource(R.string.broker_history), color = BtColors.textPrimary)
        if (orders.isEmpty()) {
            Text(stringResource(R.string.broker_no_history), color = BtColors.textSecondary, fontSize = 12.sp, modifier = Modifier.padding(vertical = 8.dp))
        } else {
            val visible = orders.take(50)
            Column(modifier = Modifier.background(BtColors.card)) {
                visible.forEachIndexed { index, order ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text(
                            stringResource(if (order.side == OrderSide.Buy) R.string.broker_order_buy else R.string.broker_order_sell),
                            color = if (order.side == OrderSide.Buy) BtColors.green else BtColors.red,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp,
                        )
                        Text(order.symbol, color = BtColors.textPrimary, fontFamily = BtMonoFontFamily, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text(
                            "${"%.4g".format(order.quantity)} @ ${"%.2f".format(order.price)}",
                            color = BtColors.textSecondary,
                            fontFamily = BtMonoFontFamily,
                            fontSize = 11.sp,
                        )
                    }
                    if (index != visible.lastIndex) HorizontalDivider(color = BtColors.border)
                }
            }
        }
    }
}
