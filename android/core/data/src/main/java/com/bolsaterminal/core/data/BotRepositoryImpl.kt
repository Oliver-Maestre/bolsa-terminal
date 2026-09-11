package com.bolsaterminal.core.data

import com.bolsaterminal.core.model.BotConfigRequest
import com.bolsaterminal.core.network.BolsaApiService
import com.bolsaterminal.domain.repository.BotRepository
import javax.inject.Inject

class BotRepositoryImpl @Inject constructor(
    private val api: BolsaApiService,
) : BotRepository {
    override suspend fun getStatus() = api.getBotStatus()
    override suspend fun getLog(limit: Int) = api.getBotLog(limit)
    override suspend fun configure(enabled: Boolean?, mode: String?, targetSymbols: List<String>?, scanInterval: Double?) =
        api.configureBot(BotConfigRequest(enabled, mode, targetSymbols, scanInterval))
}
