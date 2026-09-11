package com.bolsaterminal.features.simulator

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.designsystem.components.ErrorBanner
import com.bolsaterminal.core.designsystem.components.LoadingIndicator
import com.bolsaterminal.core.designsystem.components.MetricTile
import com.bolsaterminal.core.model.ProjectionResult

@Composable
fun ProjectionScreen(viewModel: ProjectionViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier.fillMaxSize().background(BtColors.background).verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        OutlinedTextField(value = viewModel.symbol, onValueChange = { viewModel.symbol = it.uppercase() }, label = { Text(stringResource(R.string.projection_symbol)) }, singleLine = true, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = viewModel.amount, onValueChange = { viewModel.amount = it }, label = { Text(stringResource(R.string.projection_amount)) }, singleLine = true, modifier = Modifier.fillMaxWidth())
        Button(onClick = viewModel::run, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.projection_calculate)) }

        when (val current = state) {
            is UiState.Idle -> Unit
            is UiState.Loading -> LoadingIndicator(modifier = Modifier.fillMaxWidth().height(200.dp))
            is UiState.Error -> ErrorBanner(message = current.message, onRetry = viewModel::run, modifier = Modifier.fillMaxWidth().height(200.dp))
            is UiState.Loaded -> ProjectionResultView(current.data)
        }
    }
}

@Composable
private fun ProjectionResultView(result: ProjectionResult) {
    Column(
        modifier = Modifier.fillMaxWidth().background(BtColors.card, RoundedCornerShape(10.dp)).padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            MetricTile(label = stringResource(R.string.projection_current_price), value = result.currentPrice, isCurrency = true, modifier = Modifier.weight(1f))
            MetricTile(label = stringResource(R.string.projection_shares), value = result.shares, modifier = Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            MetricTile(label = stringResource(R.string.projection_annual_return), value = result.annualReturn, isPercent = true, colored = true, modifier = Modifier.weight(1f))
            MetricTile(label = stringResource(R.string.projection_annual_vol), value = result.annualVol, isPercent = true, modifier = Modifier.weight(1f))
        }

        val horizons = result.projections.sortedBy { it.days }
        Box(modifier = Modifier.fillMaxWidth().height(220.dp)) {
            ProjectionChart(horizons = horizons, investment = result.investment, modifier = Modifier.fillMaxSize())
        }

        Column {
            horizons.forEachIndexed { index, h ->
                Row(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
                    Text(h.label, color = BtColors.textPrimary, fontSize = 12.sp, modifier = Modifier.weight(1f))
                    Text(
                        stringResource(R.string.projection_prob_profit, "%.0f".format(h.probProfit)),
                        color = if (h.probProfit >= 50) BtColors.green else BtColors.red,
                        fontSize = 12.sp,
                    )
                }
                if (index != horizons.lastIndex) HorizontalDivider(color = BtColors.border)
            }
        }
    }
}
