package com.bolsaterminal.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class BacktestRating {
    @SerialName("excellent") Excellent,
    @SerialName("good") Good,
    @SerialName("neutral") Neutral,
    @SerialName("poor") Poor,
    @SerialName("bad") Bad,
}

@Serializable
data class BacktestChartPoint(
    val date: String,
    val symbol: Double,
    val spx: Double? = null,
    val ibex: Double? = null,
)

@Serializable
data class BacktestResult(
    val symbol: String,
    val buyDate: String,
    val sellDate: String,
    val buyPrice: Double,
    val sellPrice: Double,
    val quantity: Double,
    val pnl: Double,
    val returnPct: Double,
    val annualizedReturn: Double,
    val holdDays: Double,
    val rating: BacktestRating,
    val alphaSPX: Double? = null,
    val benchmarkReturnSPX: Double? = null,
    val benchmarkReturnIBEX: Double? = null,
    val chart: List<BacktestChartPoint>,
)

@Serializable
data class ProjectionHorizon(
    val key: String,
    val label: String,
    val days: Double,
    val p5: Double,
    val p25: Double,
    val p50: Double,
    val p75: Double,
    val p95: Double,
    val retP50: Double,
    val retP25: Double,
    val retP75: Double,
    val probProfit: Double,
)

@Serializable
data class ProjectionResult(
    val symbol: String,
    val currentPrice: Double,
    val investment: Double,
    val shares: Double,
    val annualReturn: Double,
    val annualVol: Double,
    val dataPoints: Int,
    val projections: List<ProjectionHorizon>,
)
