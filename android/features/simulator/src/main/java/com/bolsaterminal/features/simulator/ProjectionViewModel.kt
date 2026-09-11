package com.bolsaterminal.features.simulator

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.model.ProjectionResult
import com.bolsaterminal.domain.usecase.GetProjectionUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProjectionViewModel @Inject constructor(
    private val getProjection: GetProjectionUseCase,
) : ViewModel() {

    var symbol by mutableStateOf("AAPL")
    var amount by mutableStateOf("1000")
    var invalidAmount by mutableStateOf(false)
        private set

    private val _state = MutableStateFlow<UiState<ProjectionResult>>(UiState.Idle)
    val state: StateFlow<UiState<ProjectionResult>> = _state.asStateFlow()

    fun run() {
        val amountValue = amount.toDoubleOrNull()
        if (amountValue == null || amountValue <= 0) {
            invalidAmount = true
            return
        }
        invalidAmount = false
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                val params = mapOf("symbol" to symbol.uppercase(), "amount" to amountValue.toString())
                _state.value = UiState.Loaded(getProjection(params))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message.orEmpty())
            }
        }
    }
}
