package com.bolsaterminal.core.model

import kotlinx.serialization.Serializable

@Serializable
data class SearchResult(
    val symbol: String,
    val shortname: String,
    val longname: String? = null,
    val exchange: String,
    val quoteType: String,
)

@Serializable
data class ScreenerItem(
    val symbol: String,
    val shortName: String,
    val exchange: String,
    val sector: String? = null,
    val quoteType: String,
    val price: Double,
    val change: Double,
    val changePercent: Double,
    val volume: Double,
    val marketCap: Double? = null,
    val rsi: Double,
    val macdHistogram: Double,
    val bbPercent: Double,
    val signal: SignalType,
    val score: Double,
    val sparkline: List<Double>,
)

@Serializable
data class MarketIndex(
    val symbol: String,
    val name: String,
    val price: Double,
    val change: Double,
    val changePercent: Double,
    val sparkline: List<Double>,
    val marketId: String,
)
