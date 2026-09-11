package com.bolsaterminal.core.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "portfolio_positions")
data class PortfolioPositionEntity(
    @PrimaryKey val id: String,
    val symbol: String,
    val name: String,
    val quantity: Double,
    val avgCost: Double,
    val addedAt: Long,
)
