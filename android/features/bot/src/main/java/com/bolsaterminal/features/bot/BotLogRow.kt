package com.bolsaterminal.features.bot

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.model.BotLogAction
import com.bolsaterminal.core.model.BotLogEntry
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun BotLogRow(entry: BotLogEntry) {
    Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp)) {
        Text(
            actionLabel(entry.action),
            color = actionColor(entry.action),
            fontWeight = FontWeight.Bold,
            fontSize = 10.sp,
            modifier = Modifier.width(50.dp),
        )
        Column {
            Row {
                entry.symbol?.let {
                    Text(it, color = BtColors.textPrimary, fontWeight = FontWeight.Bold, fontSize = 12.sp, modifier = Modifier.padding(end = 6.dp))
                }
                Text(entry.reason, color = BtColors.textSecondary, fontSize = 12.sp, maxLines = 2)
            }
            Text(
                remember(entry.timestamp) { timeFormatter.format(Date(entry.timestamp.toLong())) },
                color = BtColors.textMuted,
                fontSize = 10.sp,
            )
        }
    }
}

private val timeFormatter = SimpleDateFormat("HH:mm:ss", Locale.getDefault())

@Composable
private fun actionLabel(action: BotLogAction): String = when (action) {
    BotLogAction.Buy -> stringResource(R.string.bot_action_buy)
    BotLogAction.Sell -> stringResource(R.string.bot_action_sell)
    BotLogAction.Hold -> stringResource(R.string.bot_action_hold)
    BotLogAction.Scan -> stringResource(R.string.bot_action_scan)
    BotLogAction.Info -> stringResource(R.string.bot_action_info)
    BotLogAction.Error -> stringResource(R.string.bot_action_error)
}

private fun actionColor(action: BotLogAction): Color = when (action) {
    BotLogAction.Buy -> BtColors.green
    BotLogAction.Sell -> BtColors.red
    BotLogAction.Hold -> BtColors.textSecondary
    BotLogAction.Scan -> BtColors.accent
    BotLogAction.Info -> BtColors.textSecondary
    BotLogAction.Error -> BtColors.red
}
