package com.bolsaterminal.features.screener

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
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
import com.bolsaterminal.core.designsystem.components.ScreenerItemRow
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive

@Composable
fun ScreenerScreen(viewModel: ScreenerViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val query by viewModel.searchQuery.collectAsStateWithLifecycle()

    val lifecycleOwner = LocalLifecycleOwner.current
    LaunchedEffect(lifecycleOwner) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.RESUMED) {
            while (isActive) {
                delay(60_000)
                viewModel.refresh()
            }
        }
    }

    Column(modifier = Modifier.fillMaxSize().background(BtColors.background)) {
        OutlinedTextField(
            value = query,
            onValueChange = viewModel::onSearchQueryChange,
            placeholder = { Text(stringResource(R.string.screener_search_hint)) },
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            singleLine = true,
        )

        when (val current = state) {
            is UiState.Idle, is UiState.Loading -> LoadingIndicator(modifier = Modifier.fillMaxSize())
            is UiState.Error -> ErrorBanner(message = current.message, onRetry = viewModel::load, modifier = Modifier.fillMaxSize())
            is UiState.Loaded -> {
                val items = viewModel.filtered(current.data)
                LazyColumn {
                    items(items, key = { it.symbol }) { item ->
                        ScreenerItemRow(item)
                        HorizontalDivider(color = BtColors.border)
                    }
                }
            }
        }
    }
}
