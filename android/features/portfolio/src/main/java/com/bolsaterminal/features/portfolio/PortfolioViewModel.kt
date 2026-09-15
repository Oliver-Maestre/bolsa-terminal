package com.bolsaterminal.features.portfolio

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bolsaterminal.core.model.PortfolioPosition
import com.bolsaterminal.core.model.QuoteSummary
import com.bolsaterminal.domain.repository.MarketRepository
import com.bolsaterminal.domain.repository.PortfolioRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PortfolioMetrics(
    val totalValue: Double = 0.0,
    val totalCost: Double = 0.0,
    val totalPnL: Double = 0.0,
    val totalPnLPct: Double = 0.0,
    val dayPnL: Double = 0.0,
)

@HiltViewModel
class PortfolioViewModel @Inject constructor(
    private val repository: PortfolioRepository,
    private val marketRepository: MarketRepository,
) : ViewModel() {

    val positions: StateFlow<List<PortfolioPosition>> = repository.observePositions()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _quotes = MutableStateFlow<Map<String, QuoteSummary>>(emptyMap())
    val quotes: StateFlow<Map<String, QuoteSummary>> = _quotes.asStateFlow()

    init {
        viewModelScope.launch {
            positions.collect { list -> refreshQuotes(list) }
        }
    }

    /** Periodic silent refresh of quotes for the currently held positions. */
    fun refresh() {
        viewModelScope.launch { refreshQuotes(positions.value) }
    }

    private suspend fun refreshQuotes(positions: List<PortfolioPosition>) {
        val symbols = positions.map { it.symbol }.distinct()
        if (symbols.isEmpty()) {
            _quotes.value = emptyMap()
            return
        }
        try {
            val result = marketRepository.getBatchQuotes(symbols).associateBy { it.symbol }
            // A backend hiccup can return a valid-but-empty list rather than
            // actually failing — don't let that silently wipe good quotes.
            if (result.isNotEmpty() || _quotes.value.isEmpty()) {
                _quotes.value = result
            }
        } catch (_: Exception) {
            // Keep last known quotes — a transient failure shouldn't blank the screen.
        }
    }

    fun metrics(positions: List<PortfolioPosition>, quotes: Map<String, QuoteSummary>): PortfolioMetrics {
        var totalValue = 0.0
        var totalCost = 0.0
        var dayPnL = 0.0
        for (pos in positions) {
            val quote = quotes[pos.symbol] ?: continue
            totalValue += pos.quantity * quote.regularMarketPrice
            totalCost += pos.quantity * pos.avgCost
            dayPnL += pos.quantity * quote.regularMarketChange
        }
        val totalPnL = totalValue - totalCost
        val totalPnLPct = if (totalCost > 0) (totalPnL / totalCost) * 100 else 0.0
        return PortfolioMetrics(totalValue, totalCost, totalPnL, totalPnLPct, dayPnL)
    }

    fun addPosition(symbol: String, name: String, quantity: Double, avgCost: Double) {
        viewModelScope.launch { repository.addPosition(symbol, name, quantity, avgCost) }
    }

    fun updatePosition(id: String, symbol: String, name: String, quantity: Double, avgCost: Double) {
        viewModelScope.launch { repository.updatePosition(id, symbol, name, quantity, avgCost) }
    }

    fun removePosition(id: String) {
        viewModelScope.launch { repository.removePosition(id) }
    }
}
