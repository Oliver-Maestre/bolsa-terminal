package com.bolsaterminal.core.data

import com.bolsaterminal.core.network.BolsaApiService
import com.bolsaterminal.domain.repository.MarketRepository
import javax.inject.Inject

class MarketRepositoryImpl @Inject constructor(
    private val api: BolsaApiService,
) : MarketRepository {
    override suspend fun getMarketOverview() = api.getMarketOverview()
    override suspend fun getScreener(params: Map<String, String>) = api.getScreener(params)
    override suspend fun getQuote(symbol: String) = api.getQuote(symbol)
    override suspend fun getBatchQuotes(symbols: List<String>) = api.getBatchQuotes(symbols.joinToString(","))
    override suspend fun getHistory(symbol: String, period: String, interval: String) =
        api.getHistory(symbol, period, interval)
    override suspend fun search(query: String) = api.search(query)
}
