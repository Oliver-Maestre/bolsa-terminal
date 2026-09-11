package com.bolsaterminal.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class OHLCVBar(
    val time: Double,
    val open: Double,
    val high: Double,
    val low: Double,
    val close: Double,
    val volume: Double,
)

/**
 * Warmup periods (e.g. EMA200 needs 200 bars) produce NaN on the backend,
 * which `JSON.stringify` serializes as `null` — these must stay nullable or
 * decoding throws the moment a shorter period is requested. See the same
 * fix applied to the macOS Swift models (Core/Models/History.swift).
 */
@Serializable
data class IndicatorSet(
    val rsi: List<Double?>,
    val macdLine: List<Double?>,
    val macdSignal: List<Double?>,
    val macdHistogram: List<Double?>,
    val sma20: List<Double?>,
    val sma50: List<Double?>,
    val ema20: List<Double?>,
    val ema200: List<Double?>,
    val bbUpper: List<Double?>,
    val bbMiddle: List<Double?>,
    val bbLower: List<Double?>,
    val bbPercent: List<Double?>,
    val volumeMA20: List<Double?>,
)

@Serializable
enum class SignalType {
    @SerialName("STRONG_BUY") StrongBuy,
    @SerialName("BUY") Buy,
    @SerialName("NEUTRAL") Neutral,
    @SerialName("SELL") Sell,
    @SerialName("STRONG_SELL") StrongSell,
}

@Serializable
data class SignalComponent(
    val name: String,
    val value: Double? = null,
    val signal: String,
    val score: Double,
)

@Serializable
data class Recommendation(
    val signal: SignalType,
    val score: Double,
    val components: List<SignalComponent>,
    val currentRSI: Double? = null,
    val currentMACD: Double? = null,
    val currentBBPercent: Double? = null,
    val priceVsEMA200: Double? = null,
)

@Serializable
data class HistoryResponse(
    val symbol: String,
    val bars: List<OHLCVBar>,
    val indicators: IndicatorSet,
    val recommendation: Recommendation,
)
