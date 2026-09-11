package com.bolsaterminal.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class OrderSide {
    @SerialName("BUY") Buy,
    @SerialName("SELL") Sell,
}

@Serializable
enum class OrderStatus {
    @SerialName("FILLED") Filled,
    @SerialName("CANCELLED") Cancelled,
    @SerialName("REJECTED") Rejected,
}

@Serializable
enum class TradeSource {
    @SerialName("MANUAL") Manual,
    @SerialName("BOT") Bot,
}

@Serializable
data class BrokerOrder(
    val id: String,
    val symbol: String,
    val side: OrderSide,
    val quantity: Double,
    val price: Double,
    val total: Double,
    val fee: Double,
    val status: OrderStatus,
    val timestamp: Double,
    val source: TradeSource,
    val reason: String? = null,
)

@Serializable
data class BrokerPosition(
    val symbol: String,
    val quantity: Double,
    val avgCost: Double,
    val currentPrice: Double,
    val value: Double,
    val cost: Double,
    val pnl: Double,
    val pnlPct: Double,
    val stopLoss: Double? = null,
    val takeProfit: Double? = null,
    val openedAt: Double,
    val source: TradeSource,
)

@Serializable
data class BrokerAccount(
    val cash: Double,
    val initialBalance: Double,
    val positions: List<BrokerPosition>,
    val orders: List<BrokerOrder>,
    val totalEquity: Double,
    val totalCost: Double,
    val totalPnL: Double,
    val totalPnLPct: Double,
    val totalFeesPaid: Double,
    val tradeCount: Int,
    val winCount: Int,
    val lossCount: Int,
    val winRate: Double,
)
