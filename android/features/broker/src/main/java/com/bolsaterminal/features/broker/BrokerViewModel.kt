package com.bolsaterminal.features.broker

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.model.BrokerAccount
import com.bolsaterminal.core.model.OrderSide
import com.bolsaterminal.domain.repository.BrokerRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BrokerViewModel @Inject constructor(
    private val repository: BrokerRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<UiState<BrokerAccount>>(UiState.Idle)
    val state: StateFlow<UiState<BrokerAccount>> = _state.asStateFlow()

    var orderSymbol by mutableStateOf("")
    var orderSide by mutableStateOf(OrderSide.Buy)
    var orderQuantity by mutableStateOf("")
    var orderPrice by mutableStateOf("")
    var orderStopLoss by mutableStateOf("")
    var orderTakeProfit by mutableStateOf("")
    var isSubmitting by mutableStateOf(false)
        private set
    var submitError by mutableStateOf<String?>(null)
        private set
    var showValidationError by mutableStateOf(false)
        private set
    private var consecutiveRefreshFailures = 0

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Loaded(repository.getAccount())
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message.orEmpty())
            }
        }
    }

    /**
     * Periodic silent refresh — keeps showing the last good account state
     * on failure. After 3 consecutive failures falls back to a full [load]
     * so a sustained outage surfaces as an actionable error instead of
     * staying stuck on stale data forever.
     */
    fun refresh() {
        viewModelScope.launch {
            try {
                _state.value = UiState.Loaded(repository.getAccount())
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

    fun submitOrder() {
        val quantity = orderQuantity.toDoubleOrNull()
        if (quantity == null || quantity <= 0 || orderSymbol.isBlank()) {
            showValidationError = true
            return
        }
        viewModelScope.launch {
            isSubmitting = true
            submitError = null
            showValidationError = false
            try {
                repository.placeOrder(
                    symbol = orderSymbol,
                    side = if (orderSide == OrderSide.Buy) "BUY" else "SELL",
                    quantity = quantity,
                    price = orderPrice.toDoubleOrNull(),
                    stopLoss = orderStopLoss.toDoubleOrNull(),
                    takeProfit = orderTakeProfit.toDoubleOrNull(),
                )
                orderQuantity = ""
                orderPrice = ""
                orderStopLoss = ""
                orderTakeProfit = ""
                load()
            } catch (e: Exception) {
                submitError = e.message.orEmpty()
            } finally {
                isSubmitting = false
            }
        }
    }

    fun sellAll(symbol: String) {
        viewModelScope.launch {
            try {
                repository.sellAll(symbol)
                load()
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message.orEmpty())
            }
        }
    }

    fun reset() {
        viewModelScope.launch {
            try {
                repository.reset()
                load()
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message.orEmpty())
            }
        }
    }
}
