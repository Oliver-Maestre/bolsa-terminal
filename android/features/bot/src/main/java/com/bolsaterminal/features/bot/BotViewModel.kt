package com.bolsaterminal.features.bot

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bolsaterminal.core.common.Constants
import com.bolsaterminal.core.common.UiState
import com.bolsaterminal.core.model.BotLogEntry
import com.bolsaterminal.core.model.BotMode
import com.bolsaterminal.core.model.BotStatus
import com.bolsaterminal.core.network.SseClient
import com.bolsaterminal.domain.repository.BotRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import javax.inject.Inject

@HiltViewModel
class BotViewModel @Inject constructor(
    private val repository: BotRepository,
    private val sseClient: SseClient,
    private val json: Json,
) : ViewModel() {

    private val _state = MutableStateFlow<UiState<BotStatus>>(UiState.Idle)
    val state: StateFlow<UiState<BotStatus>> = _state.asStateFlow()

    private val _log = MutableStateFlow<List<BotLogEntry>>(emptyList())
    val log: StateFlow<List<BotLogEntry>> = _log.asStateFlow()

    var selectedMode by mutableStateOf(BotMode.Moderate)
    var targetSymbolsText by mutableStateOf("")
    var scanInterval by mutableStateOf("60")
    var isStreaming by mutableStateOf(false)
        private set

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                val status = repository.getStatus()
                _log.value = repository.getLog(100)
                selectedMode = status.config.mode
                scanInterval = status.config.scanInterval.toInt().toString()
                targetSymbolsText = status.config.targetSymbols.joinToString(", ")
                _state.value = UiState.Loaded(status)
                startStreaming()
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message.orEmpty())
            }
        }
    }

    private fun startStreaming() {
        if (isStreaming) return
        isStreaming = true
        sseClient.connect(
            path = Constants.SSE_BOT_STREAM_PATH,
            onEvent = { raw ->
                try {
                    val newEntries = json.decodeFromString<List<BotLogEntry>>(raw)
                    val existingIds = _log.value.map { it.id }.toSet()
                    val toInsert = newEntries.filter { it.id !in existingIds }
                    if (toInsert.isNotEmpty()) {
                        _log.value = (toInsert + _log.value).take(300)
                    }
                } catch (_: Exception) {
                    // Ping comments and malformed frames are ignored — best-effort stream.
                }
            },
            onComplete = { isStreaming = false },
        )
    }

    override fun onCleared() {
        super.onCleared()
        sseClient.cancel()
    }

    fun toggleEnabled() {
        val current = (state.value as? UiState.Loaded)?.data ?: return
        configure(enabled = !current.config.enabled)
    }

    fun applyConfig() {
        val symbols = targetSymbolsText.split(",").map { it.trim().uppercase() }.filter { it.isNotEmpty() }
        configure(mode = selectedMode.name.lowercase(), targetSymbols = symbols, scanInterval = scanInterval.toDoubleOrNull() ?: 60.0)
    }

    private fun configure(
        enabled: Boolean? = null,
        mode: String? = null,
        targetSymbols: List<String>? = null,
        scanInterval: Double? = null,
    ) {
        viewModelScope.launch {
            try {
                _state.value = UiState.Loaded(repository.configure(enabled, mode, targetSymbols, scanInterval))
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message.orEmpty())
            }
        }
    }
}
