package com.bolsaterminal.domain.repository

import com.bolsaterminal.core.model.PortfolioPosition
import kotlinx.coroutines.flow.Flow

/** Implemented in :core:data (PortfolioRepositoryImpl), backed by Room. */
interface PortfolioRepository {
    fun observePositions(): Flow<List<PortfolioPosition>>
    suspend fun addPosition(symbol: String, name: String, quantity: Double, avgCost: Double)
    suspend fun updatePosition(id: String, symbol: String, name: String, quantity: Double, avgCost: Double)
    suspend fun removePosition(id: String)
}
