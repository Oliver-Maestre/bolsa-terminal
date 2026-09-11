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

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                _state.value = UiState.Loaded(getScreener())
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message.orEmpty())
            }
        }
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
