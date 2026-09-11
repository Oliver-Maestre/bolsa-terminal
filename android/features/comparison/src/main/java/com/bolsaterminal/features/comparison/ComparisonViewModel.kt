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
                val period = _period.value
                val result = coroutineScope {
                    symbols.map { symbol -> async { symbol to getHistory(symbol, period, "1d").bars } }.awaitAll()
                }.toMap()
                _state.value = UiState.Loaded(result)
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message.orEmpty())
            }
        }
    }
}
