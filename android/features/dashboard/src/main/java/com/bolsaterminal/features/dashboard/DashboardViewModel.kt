package com.bolsaterminal.features.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.model.MarketIndex
import com.bolsaterminal.core.model.ScreenerItem
import com.bolsaterminal.domain.usecase.GetMarketOverviewUseCase
import com.bolsaterminal.domain.usecase.GetScreenerUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DashboardUiModel(
    val indices: List<MarketIndex>,
    val topMovers: List<ScreenerItem>,
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val getMarketOverview: GetMarketOverviewUseCase,
    private val getScreener: GetScreenerUseCase,
) : ViewModel() {

    private val _state = MutableStateFlow<UiState<DashboardUiModel>>(UiState.Idle)
    val state: StateFlow<UiState<DashboardUiModel>> = _state.asStateFlow()
    private var consecutiveRefreshFailures = 0

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Loaded(fetch())
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message.orEmpty())
            }
        }
    }

    /**
     * Periodic silent refresh — keeps showing the last good data on
     * failure, no loading spinner. After 3 consecutive failures falls back
     * to a full [load] so a sustained outage surfaces as an actionable
     * error instead of staying stuck on stale/empty data forever.
     */
    fun refresh() {
        viewModelScope.launch {
            try {
                _state.value = UiState.Loaded(fetch())
                consecutiveRefreshFailures = 0
            } catch (_: Exception) {
                consecutiveRefreshFailures++
                if (consecutiveRefreshFailures >= 3) {
                    consecutiveRefreshFailures = 0
                    load()
                }
            }
        }
    }

    private suspend fun fetch(): DashboardUiModel {
        val indices = getMarketOverview()
        val screener = getScreener()
        val topMovers = screener.sortedByDescending { kotlin.math.abs(it.changePercent) }.take(10)

        // A backend hiccup can return a valid-but-empty list rather than
        // actually failing — don't let that silently wipe good data on screen.
        val current = (_state.value as? UiState.Loaded<DashboardUiModel>)?.data
        if (indices.isEmpty() && current?.indices?.isNotEmpty() == true) {
            throw IllegalStateException("Empty market overview response")
        }
        if (topMovers.isEmpty() && current?.topMovers?.isNotEmpty() == true) {
            throw IllegalStateException("Empty screener response")
        }
        return DashboardUiModel(indices, topMovers)
    }
}
