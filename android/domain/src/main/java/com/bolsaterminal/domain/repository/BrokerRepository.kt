package com.bolsaterminal.domain.repository

import com.bolsaterminal.core.model.BrokerAccount
import com.bolsaterminal.core.model.BrokerOrderResponse

/** Implemented in :core:data (BrokerRepositoryImpl), wrapping BolsaApiService's broker routes. */
interface BrokerRepository {
    suspend fun getAccount(): BrokerAccount
    suspend fun placeOrder(
        symbol: String,
        side: String,
        quantity: Double,
        price: Double? = null,
        stopLoss: Double? = null,
        takeProfit: Double? = null,
    ): BrokerOrderResponse
    suspend fun sellAll(symbol: String): BrokerOrderResponse
    suspend fun reset()
}
