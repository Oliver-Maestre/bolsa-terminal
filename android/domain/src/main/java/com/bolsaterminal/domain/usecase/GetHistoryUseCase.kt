package com.bolsaterminal.domain.usecase

import com.bolsaterminal.core.model.HistoryResponse
import com.bolsaterminal.domain.repository.MarketRepository
import javax.inject.Inject

class GetHistoryUseCase @Inject constructor(
    private val repository: MarketRepository,
) {
    suspend operator fun invoke(symbol: String, period: String = "10y", interval: String = "1d"): HistoryResponse =
        repository.getHistory(symbol, period, interval)
}
