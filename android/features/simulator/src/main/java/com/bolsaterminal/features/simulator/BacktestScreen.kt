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
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.designsystem.components.ErrorBanner
import com.bolsaterminal.core.designsystem.components.LoadingIndicator
import com.bolsaterminal.core.designsystem.components.MetricTile
import com.bolsaterminal.core.model.BacktestRating
import com.bolsaterminal.core.model.BacktestResult

@Composable
fun BacktestScreen(viewModel: BacktestViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier.fillMaxSize().background(BtColors.background).verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        OutlinedTextField(value = viewModel.symbol, onValueChange = { viewModel.symbol = it.uppercase() }, label = { Text(stringResource(R.string.backtest_symbol)) }, singleLine = true, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = viewModel.buyDateText, onValueChange = { viewModel.buyDateText = it }, label = { Text(stringResource(R.string.backtest_buy_date)) }, singleLine = true, modifier = Modifier.fillMaxWidth())
        if (viewModel.invalidDate) {
            Text(stringResource(R.string.backtest_invalid_date), color = BtColors.red)
        }
        OutlinedTextField(value = viewModel.quantity, onValueChange = { viewModel.quantity = it }, label = { Text(stringResource(R.string.backtest_quantity)) }, singleLine = true, modifier = Modifier.fillMaxWidth())
        Button(onClick = viewModel::run, modifier = Modifier.fillMaxWidth()) { Text(stringResource(R.string.backtest_calculate)) }

        when (val current = state) {
            is UiState.Idle -> Unit
            is UiState.Loading -> LoadingIndicator(modifier = Modifier.fillMaxWidth().height(200.dp))
            is UiState.Error -> ErrorBanner(message = current.message, onRetry = viewModel::run, modifier = Modifier.fillMaxWidth().height(200.dp))
            is UiState.Loaded -> BacktestResultView(current.data)
        }
    }
}

@Composable
private fun BacktestResultView(result: BacktestResult) {
    Column(
        modifier = Modifier.fillMaxWidth().background(BtColors.card, RoundedCornerShape(10.dp)).padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(ratingLabel(result.rating), color = ratingColor(result.rating))

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            MetricTile(label = stringResource(R.string.backtest_buy_price), value = result.buyPrice, isCurrency = true, modifier = Modifier.weight(1f))
            MetricTile(label = stringResource(R.string.backtest_sell_price), value = result.sellPrice, isCurrency = true, modifier = Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            MetricTile(label = stringResource(R.string.backtest_return), value = result.returnPct, isPercent = true, colored = true, modifier = Modifier.weight(1f))
            MetricTile(label = stringResource(R.string.backtest_annualized_return), value = result.annualizedReturn, isPercent = true, colored = true, modifier = Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            result.alphaSPX?.let {
                MetricTile(label = stringResource(R.string.backtest_alpha), value = it, isPercent = true, colored = true, modifier = Modifier.weight(1f))
            }
            MetricTile(label = stringResource(R.string.backtest_hold_days), value = result.holdDays, modifier = Modifier.weight(1f))
        }

        if (result.chart.isNotEmpty()) {
            Box(modifier = Modifier.fillMaxWidth().height(200.dp)) {
                BacktestChart(points = result.chart, modifier = Modifier.fillMaxSize())
            }
        }
    }
}

@Composable
private fun ratingLabel(rating: BacktestRating) = stringResource(
    when (rating) {
        BacktestRating.Excellent -> R.string.backtest_rating_excellent
        BacktestRating.Good -> R.string.backtest_rating_good
        BacktestRating.Neutral -> R.string.backtest_rating_neutral
        BacktestRating.Poor -> R.string.backtest_rating_poor
        BacktestRating.Bad -> R.string.backtest_rating_bad
    },
)

private fun ratingColor(rating: BacktestRating) = when (rating) {
    BacktestRating.Excellent, BacktestRating.Good -> BtColors.green
    BacktestRating.Neutral -> BtColors.textSecondary
    BacktestRating.Poor -> BtColors.yellow
    BacktestRating.Bad -> BtColors.red
}
