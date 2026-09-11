package com.bolsaterminal.core.common

sealed interface UiState<out T> {
    data object Idle : UiState<Nothing>
    data object Loading : UiState<Nothing>
    data class Loaded<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}
