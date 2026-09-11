package com.bolsaterminal.core.data

import com.bolsaterminal.core.data.local.PortfolioDao
import com.bolsaterminal.core.data.local.PortfolioPositionEntity
import com.bolsaterminal.core.model.PortfolioPosition
import com.bolsaterminal.domain.repository.PortfolioRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.UUID
import javax.inject.Inject

class PortfolioRepositoryImpl @Inject constructor(
    private val dao: PortfolioDao,
) : PortfolioRepository {

    override fun observePositions(): Flow<List<PortfolioPosition>> =
        dao.observeAll().map { entities -> entities.map { it.toDomain() } }

    override suspend fun addPosition(symbol: String, name: String, quantity: Double, avgCost: Double) {
        dao.insert(
            PortfolioPositionEntity(
                id = UUID.randomUUID().toString(),
                symbol = symbol.uppercase(),
                name = name,
                quantity = quantity,
                avgCost = avgCost,
                addedAt = System.currentTimeMillis(),
            ),
        )
    }

    override suspend fun updatePosition(id: String, symbol: String, name: String, quantity: Double, avgCost: Double) {
        val existing = dao.getById(id) ?: return
        dao.update(
            existing.copy(symbol = symbol.uppercase(), name = name, quantity = quantity, avgCost = avgCost),
        )
    }

    override suspend fun removePosition(id: String) {
        dao.deleteById(id)
    }
}

private fun PortfolioPositionEntity.toDomain() = PortfolioPosition(
    id = id, symbol = symbol, name = name, quantity = quantity, avgCost = avgCost, addedAt = addedAt,
)
