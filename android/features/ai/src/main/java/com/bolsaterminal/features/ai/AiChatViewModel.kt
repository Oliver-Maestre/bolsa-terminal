package com.bolsaterminal.features.ai

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bolsaterminal.core.common.Constants
import com.bolsaterminal.core.model.AiChatMessage
import com.bolsaterminal.core.model.AiChatRequest
import com.bolsaterminal.core.network.SseClient
import com.bolsaterminal.domain.repository.AiRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID
import javax.inject.Inject

data class ChatDisplayMessage(
    val id: String = UUID.randomUUID().toString(),
    val role: String,
    val content: String,
)

@Serializable
private data class StreamChunk(val chunk: String? = null, val done: Boolean? = null, val error: String? = null)

@HiltViewModel
class AiChatViewModel @Inject constructor(
    private val aiRepository: AiRepository,
    private val sseClient: SseClient,
    private val json: Json,
) : ViewModel() {

    var messages by mutableStateOf(listOf<ChatDisplayMessage>())
        private set
    var inputText by mutableStateOf("")
    var isStreaming by mutableStateOf(false)
        private set
    var errorMessage by mutableStateOf<String?>(null)
        private set
    var aiAvailable by mutableStateOf<Boolean?>(null)
        private set

    init {
        viewModelScope.launch {
            aiAvailable = try {
                aiRepository.isAvailable()
            } catch (_: Exception) {
                null
            }
        }
    }

    fun send() {
        val text = inputText.trim()
        if (text.isBlank() || isStreaming) return
        inputText = ""
        errorMessage = null

        val userMessage = ChatDisplayMessage(role = "user", content = text)
        val assistantMessage = ChatDisplayMessage(role = "assistant", content = "")
        val historyForRequest = messages + userMessage
        messages = historyForRequest + assistantMessage
        val assistantId = assistantMessage.id

        val payload = json.encodeToString(
            AiChatRequest(messages = historyForRequest.map { AiChatMessage(role = it.role, content = it.content) }),
        )

        isStreaming = true
        sseClient.connect(
            path = Constants.SSE_AI_CHAT_PATH,
            jsonBody = payload,
            onEvent = { raw ->
                try {
                    val event = json.decodeFromString<StreamChunk>(raw)
                    if (event.chunk != null) {
                        messages = messages.map { if (it.id == assistantId) it.copy(content = it.content + event.chunk) else it }
                    }
                    event.error?.let { errorMessage = it }
                } catch (_: Exception) {
                    // Malformed frame — ignore, best-effort stream.
                }
            },
            onComplete = { error ->
                isStreaming = false
                if (error != null) errorMessage = error.message
            },
        )
    }

    override fun onCleared() {
        super.onCleared()
        sseClient.cancel()
    }
}
