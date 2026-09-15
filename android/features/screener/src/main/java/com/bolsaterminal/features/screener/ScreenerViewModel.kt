package com.bolsaterminal.features.screener

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.model.ScreenerItem
import com.bolsaterminal.domain.usecase.GetScreenerUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ScreenerViewModel @Inject constructor(
    private val getScreener: GetScreenerUseCase,
) : ViewModel() {

    private val _state = MutableStateFlow<UiState<List<ScreenerItem>>>(UiState.Idle)
    val state: StateFlow<UiState<List<ScreenerItem>>> = _state.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
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

    private suspend fun fetch(): List<ScreenerItem> {
        val result = getScreener()
        // A backend hiccup can return a valid-but-empty list rather than
        // actually failing — don't let that silently wipe good data on screen.
        val current = (_state.value as? UiState.Loaded<List<ScreenerItem>>)?.data
        if (result.isEmpty() && current?.isNotEmpty() == true) {
            throw IllegalStateException("Empty screener response")
        }
        return result
    }

    fun onSearchQueryChange(query: String) {
        _searchQuery.value = query
    }

    fun filtered(items: List<ScreenerItem>): List<ScreenerItem> {
        val query = _searchQuery.value
        if (query.isBlank()) return items
        return items.filter {
            it.symbol.contains(query, ignoreCase = true) || it.shortName.contains(query, ignoreCase = true)
        }
    }
}
