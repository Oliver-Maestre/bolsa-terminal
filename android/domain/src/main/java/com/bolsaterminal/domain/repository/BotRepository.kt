package com.bolsaterminal.domain.repository

import com.bolsaterminal.core.model.BotLogEntry
import com.bolsaterminal.core.model.BotStatus

/** Implemented in :core:data (BotRepositoryImpl), wrapping BolsaApiService's bot routes. */
interface BotRepository {
    suspend fun getStatus(): BotStatus
    suspend fun getLog(limit: Int = 100): List<BotLogEntry>
    suspend fun configure(
        enabled: Boolean? = null,
        mode: String? = null,
        targetSymbols: List<String>? = null,
        scanInterval: Double? = null,
    ): BotStatus
}
