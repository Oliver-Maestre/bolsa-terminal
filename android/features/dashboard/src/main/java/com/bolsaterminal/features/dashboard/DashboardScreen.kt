package com.bolsaterminal.features.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.repeatOnLifecycle
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.designsystem.components.ErrorBanner
import com.bolsaterminal.core.designsystem.components.LoadingIndicator
import com.bolsaterminal.core.designsystem.components.ScreenerItemRow
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive

@Composable
fun DashboardScreen(viewModel: DashboardViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    val lifecycleOwner = LocalLifecycleOwner.current
    LaunchedEffect(lifecycleOwner) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.RESUMED) {
            while (isActive) {
                delay(60_000)
                viewModel.refresh()
            }
        }
    }

    when (val current = state) {
        is UiState.Idle, is UiState.Loading -> LoadingIndicator(modifier = Modifier.fillMaxSize().background(BtColors.background))
        is UiState.Error -> ErrorBanner(
            message = current.message,
            onRetry = viewModel::load,
            modifier = Modifier.fillMaxSize().background(BtColors.background),
        )
        is UiState.Loaded -> DashboardContent(current.data)
    }
}

@Composable
private fun DashboardContent(model: DashboardUiModel) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BtColors.background)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        Text(stringResource(R.string.dashboard_markets_section), color = BtColors.textPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp), contentPadding = PaddingValues(vertical = 4.dp)) {
            items(model.indices) { index -> MarketIndexCard(index) }
        }

        Text(stringResource(R.string.dashboard_top_movers_section), color = BtColors.textPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(BtColors.card, RoundedCornerShape(8.dp)),
        ) {
            model.topMovers.forEachIndexed { index, item ->
                ScreenerItemRow(item)
                if (index != model.topMovers.lastIndex) {
                    HorizontalDivider(color = BtColors.border)
                }
            }
        }
    }
}
