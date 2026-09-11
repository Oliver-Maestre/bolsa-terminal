package com.bolsaterminal.core.data

import com.bolsaterminal.core.network.BolsaApiService
import com.bolsaterminal.domain.repository.AiRepository
import javax.inject.Inject

class AiRepositoryImpl @Inject constructor(
    private val api: BolsaApiService,
) : AiRepository {
    override suspend fun isAvailable() = api.getAiStatus().available
}
