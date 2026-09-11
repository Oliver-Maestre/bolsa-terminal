package com.bolsaterminal.core.model

import kotlinx.serialization.Serializable

@Serializable
data class QuoteSummary(
    val symbol: String,
    val shortName: String,
    val longName: String? = null,
    val exchange: String,
    val currency: String,
    val regularMarketPrice: Double,
    val regularMarketChange: Double,
    val regularMarketChangePercent: Double,
    val regularMarketVolume: Double,
    val regularMarketOpen: Double? = null,
    val regularMarketDayHigh: Double? = null,
    val regularMarketDayLow: Double? = null,
    val regularMarketPreviousClose: Double? = null,
    val fiftyTwoWeekHigh: Double? = null,
    val fiftyTwoWeekLow: Double? = null,
    val marketCap: Double? = null,
    val trailingPE: Double? = null,
    val forwardPE: Double? = null,
    val dividendYield: Double? = null,
    val beta: Double? = null,
    val averageVolume: Double? = null,
    val sector: String? = null,
    val industry: String? = null,
    val quoteType: String,
    val marketState: String,
)
