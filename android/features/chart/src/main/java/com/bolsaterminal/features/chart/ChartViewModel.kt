package com.bolsaterminal.features.chart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.model.HistoryResponse
import com.bolsaterminal.core.model.SearchResult
import com.bolsaterminal.domain.usecase.GetHistoryUseCase
import com.bolsaterminal.domain.usecase.SearchSymbolsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChartViewModel @Inject constructor(
    private val getHistory: GetHistoryUseCase,
    private val searchSymbols: SearchSymbolsUseCase,
) : ViewModel() {

    companion object {
        val PERIODS = listOf("3mo", "6mo", "1y", "5y", "10y")
    }

    private val _symbol = MutableStateFlow("AAPL")
    val symbol: StateFlow<String> = _symbol.asStateFlow()

    private val _period = MutableStateFlow("1y")
    val period: StateFlow<String> = _period.asStateFlow()

    private val _state = MutableStateFlow<UiState<HistoryResponse>>(UiState.Idle)
    val state: StateFlow<UiState<HistoryResponse>> = _state.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _searchResults = MutableStateFlow<List<SearchResult>>(emptyList())
    val searchResults: StateFlow<List<SearchResult>> = _searchResults.asStateFlow()

    private var searchJob: Job? = null
    private var consecutiveRefreshFailures = 0

    init {
        load()
    }

    fun load(newSymbol: String? = null) {
        newSymbol?.let { _symbol.value = it.uppercase() }
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
     * Periodic silent refresh of the currently selected symbol/period — no
     * loading spinner. After 3 consecutive failures falls back to a full
     * [load] so a sustained outage surfaces as an actionable error instead
     * of staying stuck on stale/empty data forever.
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

    private suspend fun fetch(): HistoryResponse {
        val result = getHistory(_symbol.value, _period.value, "1d")
        // A backend hiccup can return a valid-but-empty bars list rather
        // than actually failing — don't let that silently wipe the chart.
        val current = (_state.value as? UiState.Loaded<HistoryResponse>)?.data
        if (result.bars.isEmpty() && current?.bars?.isNotEmpty() == true) {
            throw IllegalStateException("Empty history response")
        }
        return result
    }

    fun onPeriodChange(newPeriod: String) {
        _period.value = newPeriod
        load()
    }

    fun onSearchQueryChange(query: String) {
        _searchQuery.value = query
        searchJob?.cancel()
        if (query.isBlank()) {
            _searchResults.value = emptyList()
            return
        }
        searchJob = viewModelScope.launch {
            delay(300)
            try {
                _searchResults.value = searchSymbols(query)
            } catch (_: Exception) {
                // Best-effort search — ignore failures silently.
            }
        }
    }

    fun selectSearchResult(result: SearchResult) {
        _searchQuery.value = ""
        _searchResults.value = emptyList()
        load(result.symbol)
    }
}
