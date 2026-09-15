package com.bolsaterminal.features.comparison

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.model.OHLCVBar
import com.bolsaterminal.domain.usecase.GetHistoryUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ComparisonViewModel @Inject constructor(
    private val getHistory: GetHistoryUseCase,
) : ViewModel() {

    companion object {
        val PERIODS = listOf("3mo", "6mo", "1y", "5y", "10y")
    }

    private val _symbolsInput = MutableStateFlow("AAPL, MSFT")
    val symbolsInput: StateFlow<String> = _symbolsInput.asStateFlow()

    private val _period = MutableStateFlow("1y")
    val period: StateFlow<String> = _period.asStateFlow()

    private val _state = MutableStateFlow<UiState<Map<String, List<OHLCVBar>>>>(UiState.Idle)
    val state: StateFlow<UiState<Map<String, List<OHLCVBar>>>> = _state.asStateFlow()
    private var consecutiveRefreshFailures = 0

    fun onSymbolsInputChange(value: String) {
        _symbolsInput.value = value
    }

    fun onPeriodChange(value: String) {
        _period.value = value
        load()
    }

    fun load() {
        val symbols = _symbolsInput.value.split(",").map { it.trim().uppercase() }.filter { it.isNotEmpty() }
        if (symbols.isEmpty()) return

        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Loaded(fetch(symbols))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message.orEmpty())
            }
        }
    }

    /**
     * Periodic silent refresh of the currently selected symbols/period — no
     * loading spinner. After 3 consecutive failures falls back to a full
     * [load] so a sustained outage surfaces as an actionable error instead
     * of staying stuck on stale/empty data forever.
     */
    fun refresh() {
        val symbols = _symbolsInput.value.split(",").map { it.trim().uppercase() }.filter { it.isNotEmpty() }
        if (symbols.isEmpty()) return

        viewModelScope.launch {
            try {
                _state.value = UiState.Loaded(fetch(symbols))
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

    private suspend fun fetch(symbols: List<String>): Map<String, List<OHLCVBar>> {
        val period = _period.value
        val result = coroutineScope {
            symbols.map { symbol -> async { symbol to getHistory(symbol, period, "1d").bars } }.awaitAll()
        }.toMap()
        // A backend hiccup can return valid-but-empty series rather than
        // actually failing — don't let that silently wipe the comparison.
        val current = (_state.value as? UiState.Loaded<Map<String, List<OHLCVBar>>>)?.data
        val resultHasData = result.values.any { it.isNotEmpty() }
        val currentHasData = current?.values?.any { it.isNotEmpty() } == true
        if (!resultHasData && currentHasData) {
            throw IllegalStateException("Empty comparison response")
        }
        return result
    }
}
