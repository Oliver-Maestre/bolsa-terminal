package com.bolsaterminal.features.chart

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
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
import com.bolsaterminal.core.designsystem.components.CandlestickChart
import com.bolsaterminal.core.designsystem.components.ErrorBanner
import com.bolsaterminal.core.designsystem.components.IndicatorLineChart
import com.bolsaterminal.core.designsystem.components.LoadingIndicator
import com.bolsaterminal.core.designsystem.components.RecommendationCard
import com.bolsaterminal.core.designsystem.components.VolumeChart
import com.bolsaterminal.core.model.HistoryResponse

@Composable
fun ChartScreen(viewModel: ChartViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val symbol by viewModel.symbol.collectAsStateWithLifecycle()
    val period by viewModel.period.collectAsStateWithLifecycle()
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val searchResults by viewModel.searchResults.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize().background(BtColors.background)) {
        Column(modifier = Modifier.padding(12.dp)) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = viewModel::onSearchQueryChange,
                placeholder = { Text(stringResource(R.string.chart_symbol_hint)) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            if (searchResults.isNotEmpty()) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = BtColors.card),
                    modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                ) {
                    Column {
                        searchResults.take(6).forEach { result ->
                            Text(
                                "${result.symbol} — ${result.shortname}",
                                color = BtColors.textPrimary,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { viewModel.selectSearchResult(result) }
                                    .padding(10.dp),
                            )
                        }
                    }
                }
            }

            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(vertical = 10.dp),
            ) {
                items(ChartViewModel.PERIODS) { p ->
                    FilterChip(selected = p == period, onClick = { viewModel.onPeriodChange(p) }, label = { Text(p) })
                }
            }

            Text(symbol, color = BtColors.textPrimary, style = MaterialTheme.typography.titleMedium)
        }

        when (val current = state) {
            is UiState.Idle, is UiState.Loading -> LoadingIndicator(modifier = Modifier.fillMaxSize())
            is UiState.Error -> ErrorBanner(message = current.message, onRetry = { viewModel.load() }, modifier = Modifier.fillMaxSize())
            is UiState.Loaded -> ChartContent(current.data)
        }
    }
}

@Composable
private fun ChartContent(history: HistoryResponse) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp)
                .background(BtColors.card, RoundedCornerShape(8.dp)),
        ) {
            CandlestickChart(bars = history.bars, modifier = Modifier.fillMaxSize().padding(8.dp))
        }
        Box(modifier = Modifier.fillMaxWidth().height(60.dp)) {
            VolumeChart(bars = history.bars, modifier = Modifier.fillMaxSize())
        }

        IndicatorLineChart(
            title = stringResource(R.string.chart_rsi_title),
            values = history.indicators.rsi,
            referenceLines = listOf(30.0, 70.0),
        )
        IndicatorLineChart(
            title = stringResource(R.string.chart_macd_title),
            values = history.indicators.macdHistogram,
        )
        IndicatorLineChart(
            title = stringResource(R.string.chart_bb_title),
            values = history.indicators.bbPercent,
            referenceLines = listOf(0.0, 1.0),
        )

        RecommendationCard(recommendation = history.recommendation)
    }
}
