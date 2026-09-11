package com.bolsaterminal.core.data

import com.bolsaterminal.core.model.BrokerOrderRequest
import com.bolsaterminal.core.network.BolsaApiService
import com.bolsaterminal.domain.repository.BrokerRepository
import javax.inject.Inject

class BrokerRepositoryImpl @Inject constructor(
    private val api: BolsaApiService,
) : BrokerRepository {

    override suspend fun getAccount() = api.getBrokerAccount()

    override suspend fun placeOrder(
        symbol: String,
        side: String,
        quantity: Double,
        price: Double?,
        stopLoss: Double?,
        takeProfit: Double?,
    ) = api.placeBrokerOrder(
        BrokerOrderRequest(symbol = symbol.uppercase(), side = side, quantity = quantity, price = price, stopLoss = stopLoss, takeProfit = takeProfit),
    )

    override suspend fun sellAll(symbol: String) = api.brokerSellAll(symbol.uppercase())

    override suspend fun reset() {
        api.brokerReset()
    }
}
