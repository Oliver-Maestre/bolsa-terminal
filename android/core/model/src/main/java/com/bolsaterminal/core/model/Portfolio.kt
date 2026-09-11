package com.bolsaterminal.core.model

/**
 * Local-only holdings the user enters by hand — mirrors the web app's
 * `usePortfolio` Zustand store (persisted to localStorage there, to Room
 * on Android, to SwiftData on macOS). Distinct from Broker, which is
 * backend-simulated trading state.
 */
data class PortfolioPosition(
    val id: String,
    val symbol: String,
    val name: String,
    val quantity: Double,
    val avgCost: Double,
    val addedAt: Long,
)
