package com.bolsaterminal.domain.repository

import com.bolsaterminal.core.model.HistoryResponse
import com.bolsaterminal.core.model.MarketIndex
import com.bolsaterminal.core.model.QuoteSummary
import com.bolsaterminal.core.model.ScreenerItem
import com.bolsaterminal.core.model.SearchResult

/** Implemented in :core:data (MarketRepositoryImpl), wrapping BolsaApiService. */
interface MarketRepository {
    suspend fun getMarketOverview(): List<MarketIndex>
    suspend fun getScreener(params: Map<String, String> = emptyMap()): List<ScreenerItem>
    suspend fun getQuote(symbol: String): QuoteSummary
    suspend fun getBatchQuotes(symbols: List<String>): List<QuoteSummary>
    suspend fun getHistory(symbol: String, period: String = "10y", interval: String = "1d"): HistoryResponse
    suspend fun search(query: String): List<SearchResult>
}
