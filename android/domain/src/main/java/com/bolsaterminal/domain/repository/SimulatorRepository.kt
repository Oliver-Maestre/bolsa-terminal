package com.bolsaterminal.domain.repository

import com.bolsaterminal.core.model.BacktestResult
import com.bolsaterminal.core.model.ProjectionResult

/** Implemented in :core:data (SimulatorRepositoryImpl), wrapping BolsaApiService's simulator routes. */
interface SimulatorRepository {
    suspend fun getBacktest(params: Map<String, String>): BacktestResult
    suspend fun getProjection(params: Map<String, String>): ProjectionResult
}
