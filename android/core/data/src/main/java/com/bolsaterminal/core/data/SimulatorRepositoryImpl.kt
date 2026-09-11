package com.bolsaterminal.core.data

import com.bolsaterminal.core.network.BolsaApiService
import com.bolsaterminal.domain.repository.SimulatorRepository
import javax.inject.Inject

class SimulatorRepositoryImpl @Inject constructor(
    private val api: BolsaApiService,
) : SimulatorRepository {
    override suspend fun getBacktest(params: Map<String, String>) = api.getBacktest(params)
    override suspend fun getProjection(params: Map<String, String>) = api.getProjection(params)
}
