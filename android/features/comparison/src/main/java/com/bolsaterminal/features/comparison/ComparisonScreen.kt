package com.bolsaterminal.features.comparison

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.designsystem.components.ErrorBanner
import com.bolsaterminal.core.designsystem.components.LoadingIndicator
import com.bolsaterminal.core.model.OHLCVBar

@Composable
fun ComparisonScreen(viewModel: ComparisonViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val symbolsInput by viewModel.symbolsInput.collectAsStateWithLifecycle()
    val period by viewModel.period.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize().background(BtColors.background)) {
        Column(modifier = Modifier.padding(12.dp)) {
            OutlinedTextField(
                value = symbolsInput,
                onValueChange = viewModel::onSymbolsInputChange,
                placeholder = { Text(stringResource(R.string.comparison_symbols_hint)) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(vertical = 10.dp),
            ) {
                items(ComparisonViewModel.PERIODS) { p ->
                    FilterChip(selected = p == period, onClick = { viewModel.onPeriodChange(p) }, label = { Text(p) })
                }
            }
            Button(onClick = viewModel::load) { Text(stringResource(R.string.comparison_compare_button)) }
        }

        when (val current = state) {
            is UiState.Idle -> Text(
                stringResource(R.string.comparison_empty),
                color = BtColors.textSecondary,
                modifier = Modifier.padding(24.dp),
            )
            is UiState.Loading -> LoadingIndicator(modifier = Modifier.fillMaxSize())
            is UiState.Error -> ErrorBanner(message = current.message, onRetry = viewModel::load, modifier = Modifier.fillMaxSize())
            is UiState.Loaded -> ComparisonContent(current.data)
        }
    }
}

@Composable
private fun ComparisonContent(series: Map<String, List<OHLCVBar>>) {
    Column(modifier = Modifier.padding(12.dp)) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(260.dp)
                .background(BtColors.card, RoundedCornerShape(8.dp)),
        ) {
            NormalizedComparisonChart(series = series, modifier = Modifier.fillMaxSize().padding(12.dp))
        }
        Row(modifier = Modifier.padding(top = 10.dp)) {
            series.keys.forEachIndexed { index, symbol ->
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(end = 14.dp)) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(colorForSeries(index)),
                    )
                    Text(symbol, color = BtColors.textSecondary, modifier = Modifier.padding(start = 6.dp))
                }
            }
        }
    }
}
