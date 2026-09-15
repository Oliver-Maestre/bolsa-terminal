package com.bolsaterminal.features.broker

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.repeatOnLifecycle
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.designsystem.BtColors
import com.bolsaterminal.core.designsystem.components.ErrorBanner
import com.bolsaterminal.core.designsystem.components.LoadingIndicator
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive

@Composable
fun BrokerScreen(viewModel: BrokerViewModel = hiltViewModel()) {
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
        is UiState.Error -> ErrorBanner(message = current.message, onRetry = viewModel::load, modifier = Modifier.fillMaxSize().background(BtColors.background))
        is UiState.Loaded -> Column(
            modifier = Modifier
                .fillMaxSize()
                .background(BtColors.background)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            AccountSummary(account = current.data, onReset = viewModel::reset)
            OpenPositionsList(positions = current.data.positions, onSellAll = viewModel::sellAll)
            TradeHistoryList(orders = current.data.orders)
            TradingPanel(viewModel = viewModel)
        }
    }
}
