package com.bolsaterminal.features.bot

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.designsystem.components.ErrorBanner
import com.bolsaterminal.core.designsystem.components.LoadingIndicator
import com.bolsaterminal.core.model.BotMode

@Composable
fun BotScreen(viewModel: BotViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val log by viewModel.log.collectAsStateWithLifecycle()

    when (val current = state) {
        is UiState.Idle, is UiState.Loading -> LoadingIndicator(modifier = Modifier.fillMaxSize().background(BtColors.background))
        is UiState.Error -> ErrorBanner(message = current.message, onRetry = viewModel::load, modifier = Modifier.fillMaxSize().background(BtColors.background))
        // Stacked vertically rather than side-by-side — a fixed-width sidebar
        // next to a log panel leaves almost no room on phone-width screens.
        is UiState.Loaded -> Column(modifier = Modifier.fillMaxSize().background(BtColors.background).padding(16.dp)) {
            Column(
                modifier = Modifier.fillMaxWidth().verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                ConfigPanel(viewModel = viewModel, status = current.data)
            }
            Text(stringResource(R.string.bot_activity_title), color = BtColors.textPrimary, modifier = Modifier.padding(top = 16.dp))
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(top = 8.dp)
                    .background(BtColors.card, RoundedCornerShape(8.dp)),
            ) {
                items(log, key = { it.id }) { entry -> BotLogRow(entry) }
            }
        }
    }
}

@Composable
private fun ConfigPanel(viewModel: BotViewModel, status: com.bolsaterminal.core.model.BotStatus) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(stringResource(R.string.bot_config_title), color = BtColors.textPrimary)
        val dotColor = if (status.isRunning) BtColors.green else BtColors.textMuted
        androidx.compose.foundation.layout.Box(modifier = Modifier.width(8.dp).height(8.dp).clip(CircleShape).background(dotColor))
    }

    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        FilterChip(selected = viewModel.selectedMode == BotMode.Conservative, onClick = { viewModel.selectedMode = BotMode.Conservative }, label = { Text(stringResource(R.string.bot_mode_conservative)) })
        FilterChip(selected = viewModel.selectedMode == BotMode.Moderate, onClick = { viewModel.selectedMode = BotMode.Moderate }, label = { Text(stringResource(R.string.bot_mode_moderate)) })
        FilterChip(selected = viewModel.selectedMode == BotMode.Aggressive, onClick = { viewModel.selectedMode = BotMode.Aggressive }, label = { Text(stringResource(R.string.bot_mode_aggressive)) })
    }

    OutlinedTextField(
        value = viewModel.targetSymbolsText, onValueChange = { viewModel.targetSymbolsText = it },
        label = { Text(stringResource(R.string.bot_target_symbols_hint)) },
        singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
    )
    OutlinedTextField(
        value = viewModel.scanInterval, onValueChange = { viewModel.scanInterval = it },
        label = { Text(stringResource(R.string.bot_scan_interval_hint)) },
        singleLine = true, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
    )
    Button(onClick = viewModel::applyConfig, modifier = Modifier.fillMaxWidth()) {
        Text(stringResource(R.string.bot_apply_config))
    }

    Button(
        onClick = viewModel::toggleEnabled,
        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
        colors = ButtonDefaults.buttonColors(containerColor = if (status.config.enabled) BtColors.red else BtColors.green),
    ) {
        Text(stringResource(if (status.config.enabled) R.string.bot_stop else R.string.bot_start))
    }

    Text(stringResource(R.string.bot_scans, status.scanCount), color = BtColors.textSecondary, fontSize = 11.sp, modifier = Modifier.padding(top = 8.dp))
    Text(
        stringResource(R.string.bot_params_1, "%.0f".format(status.params.minScore), "%.0f".format(status.params.maxRSI)),
        color = BtColors.textSecondary, fontSize = 11.sp,
    )
    Text(
        stringResource(R.string.bot_params_2, "%.0f".format(status.params.stopLossPct), "%.0f".format(status.params.takeProfitPct)),
        color = BtColors.textSecondary, fontSize = 11.sp,
    )
}
