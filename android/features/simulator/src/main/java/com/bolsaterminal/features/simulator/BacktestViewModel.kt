package com.bolsaterminal.features.simulator

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.model.BacktestResult
import com.bolsaterminal.domain.usecase.GetBacktestUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

@HiltViewModel
class BacktestViewModel @Inject constructor(
    private val getBacktest: GetBacktestUseCase,
) : ViewModel() {

    var symbol by mutableStateOf("AAPL")
    var buyDateText by mutableStateOf(LocalDate.now().minusYears(1).toString())
    var quantity by mutableStateOf("10")
    var invalidDate by mutableStateOf(false)
        private set

    private val _state = MutableStateFlow<UiState<BacktestResult>>(UiState.Idle)
    val state: StateFlow<UiState<BacktestResult>> = _state.asStateFlow()

    fun run() {
        val buyDate = runCatching { LocalDate.parse(buyDateText) }.getOrNull()
        if (buyDate == null) {
            invalidDate = true
            return
        }
        invalidDate = false
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                val params = mutableMapOf("symbol" to symbol.uppercase(), "buyDate" to buyDate.toString())
                quantity.toDoubleOrNull()?.let { params["quantity"] = it.toString() }
                _state.value = UiState.Loaded(getBacktest(params))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message.orEmpty())
            }
        }
    }
}
