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

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                val indices = getMarketOverview()
                val screener = getScreener()
                val topMovers = screener.sortedByDescending { kotlin.math.abs(it.changePercent) }.take(10)
                _state.value = UiState.Loaded(DashboardUiModel(indices, topMovers))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message.orEmpty())
            }
        }
    }
}
