package com.bolsaterminal.core.network

import com.bolsaterminal.core.model.AiRecommendations
import com.bolsaterminal.core.model.AiStatusResponse
import com.bolsaterminal.core.model.BacktestResult
import com.bolsaterminal.core.model.BotConfigRequest
import com.bolsaterminal.core.model.BotLogEntry
import com.bolsaterminal.core.model.BotStatus
import com.bolsaterminal.core.model.BrokerAccount
import com.bolsaterminal.core.model.BrokerOrderRequest
import com.bolsaterminal.core.model.BrokerOrderResponse
import com.bolsaterminal.core.model.BrokerResetResponse
import com.bolsaterminal.core.model.HistoryResponse
import com.bolsaterminal.core.model.MarketIndex
import com.bolsaterminal.core.model.ProjectionResult
import com.bolsaterminal.core.model.QuoteSummary
import com.bolsaterminal.core.model.ScreenerItem
import com.bolsaterminal.core.model.SearchResult
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.QueryMap

/** Mirrors frontend/src/api/client.ts 1:1 — see docs/api-contract.md. */
interface BolsaApiService {

    @GET("api/quotes/{symbol}")
    suspend fun getQuote(@Path("symbol") symbol: String): QuoteSummary

    @GET("api/quotes")
    suspend fun getBatchQuotes(@Query("symbols") symbols: String): List<QuoteSummary>

    @GET("api/history/{symbol}")
    suspend fun getHistory(
        @Path("symbol") symbol: String,
        @Query("period") period: String = "10y",
        @Query("interval") interval: String = "1d",
    ): HistoryResponse

    @GET("api/search")
    suspend fun search(@Query("q") query: String): List<SearchResult>

    @GET("api/screener")
    suspend fun getScreener(@QueryMap params: Map<String, String> = emptyMap()): List<ScreenerItem>

    @GET("api/markets/overview")
    suspend fun getMarketOverview(): List<MarketIndex>

    @GET("api/broker/account")
    suspend fun getBrokerAccount(): BrokerAccount

    @POST("api/broker/order")
    suspend fun placeBrokerOrder(@Body body: BrokerOrderRequest): BrokerOrderResponse

    @POST("api/broker/sell-all/{symbol}")
    suspend fun brokerSellAll(@Path("symbol") symbol: String): BrokerOrderResponse

    @POST("api/broker/reset")
    suspend fun brokerReset(): BrokerResetResponse

    @GET("api/bot/status")
    suspend fun getBotStatus(): BotStatus

    @GET("api/bot/log")
    suspend fun getBotLog(@Query("limit") limit: Int = 100): List<BotLogEntry>

    @POST("api/bot/configure")
    suspend fun configureBot(@Body body: BotConfigRequest): BotStatus

    @POST("api/bot/scan")
    suspend fun triggerBotScan()

    @GET("api/ai/status")
    suspend fun getAiStatus(): AiStatusResponse

    @GET("api/ai/recommendations")
    suspend fun getAiRecommendations(): AiRecommendations

    @GET("api/simulator/backtest")
    suspend fun getBacktest(@QueryMap params: Map<String, String>): BacktestResult

    @GET("api/simulator/projection")
    suspend fun getProjection(@QueryMap params: Map<String, String>): ProjectionResult

    // /api/ai/chat and /api/bot/stream are SSE — handled by SseClient, not Retrofit.
}
