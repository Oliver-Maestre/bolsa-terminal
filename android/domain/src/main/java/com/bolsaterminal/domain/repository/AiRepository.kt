package com.bolsaterminal.domain.repository

/** Implemented in :core:data (AiRepositoryImpl). Chat itself is SSE, handled by SseClient directly. */
interface AiRepository {
    suspend fun isAvailable(): Boolean
}
