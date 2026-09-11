package com.bolsaterminal.features.broker

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.designsystem.components.MetricTile
import com.bolsaterminal.core.model.BrokerAccount

@Composable
fun AccountSummary(account: BrokerAccount, onReset: () -> Unit) {
    Column {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(stringResource(R.string.broker_account_title), color = BtColors.textPrimary)
            TextButton(onClick = onReset) { Text(stringResource(R.string.broker_reset), color = BtColors.red) }
        }
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricTile(label = stringResource(R.string.broker_cash), value = account.cash, isCurrency = true, modifier = Modifier.weight(1f))
                MetricTile(label = stringResource(R.string.broker_equity), value = account.totalEquity, isCurrency = true, modifier = Modifier.weight(1f))
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricTile(label = stringResource(R.string.broker_pnl), value = account.totalPnL, isCurrency = true, colored = true, modifier = Modifier.weight(1f))
                MetricTile(label = stringResource(R.string.broker_pnl_pct), value = account.totalPnLPct, isPercent = true, colored = true, modifier = Modifier.weight(1f))
            }
        }
        Text(
            stringResource(R.string.broker_stats, account.tradeCount, "%.0f".format(account.winRate)),
            color = BtColors.textSecondary,
            fontSize = 11.sp,
        )
    }
}
