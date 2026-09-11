package com.bolsaterminal.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class BotMode {
    @SerialName("conservative") Conservative,
    @SerialName("moderate") Moderate,
    @SerialName("aggressive") Aggressive,
}

@Serializable
data class BotConfig(
    val enabled: Boolean,
    val mode: BotMode,
    val targetSymbols: List<String>,
    val scanInterval: Double,
)

@Serializable
data class BotParams(
    val minScore: Double,
    val maxRSI: Double,
    val stopLossPct: Double,
    val takeProfitPct: Double,
    val maxPositions: Int,
    val positionSizePct: Double,
    val sellScore: Double,
)

@Serializable
data class BotStatus(
    val config: BotConfig,
    val params: BotParams,
    val scanCount: Int,
    val isRunning: Boolean,
    val logCount: Int,
)

@Serializable
enum class BotLogAction {
    @SerialName("BUY") Buy,
    @SerialName("SELL") Sell,
    @SerialName("HOLD") Hold,
    @SerialName("SCAN") Scan,
    @SerialName("INFO") Info,
    @SerialName("ERROR") Error,
}

@Serializable
data class BotLogEntry(
    val id: String,
    val timestamp: Double,
    val action: BotLogAction,
    val symbol: String? = null,
    val price: Double? = null,
    val quantity: Double? = null,
    val reason: String,
    val score: Double? = null,
    val rsi: Double? = null,
    val pnl: Double? = null,
)
