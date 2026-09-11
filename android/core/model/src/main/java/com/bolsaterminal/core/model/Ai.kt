package com.bolsaterminal.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class InvestmentTimeframe {
    @SerialName("short") Short,
    @SerialName("medium") Medium,
    @SerialName("long") Long,
}

@Serializable
data class InvestmentRecommendation(
    val symbol: String,
    val shortName: String,
    val exchange: String,
    val price: Double,
    val signal: String,
    val score: Double,
    val rsi: Double,
    val macdHistogram: Double,
    val bbPercent: Double,
    val changePercent: Double,
    val timeframe: InvestmentTimeframe,
    val confidence: Double,
    val entryZone: List<Double>,
    val stopLoss: Double,
    val takeProfit: Double,
    val riskReward: Double,
    val reasons: List<String>,
    val risks: List<String>,
    val horizon: String,
    val strategy: String,
)

@Serializable
data class AiRecommendations(
    val short: List<InvestmentRecommendation>,
    val medium: List<InvestmentRecommendation>,
    val long: List<InvestmentRecommendation>,
)

@Serializable
data class ChatMessage(
    val id: String,
    val role: String,
    val content: String,
    val timestamp: Double,
)
