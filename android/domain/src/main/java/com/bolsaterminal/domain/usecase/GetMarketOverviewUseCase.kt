package com.bolsaterminal.domain.usecase

import com.bolsaterminal.core.model.MarketIndex
import com.bolsaterminal.domain.repository.MarketRepository
import javax.inject.Inject

class GetMarketOverviewUseCase @Inject constructor(
    private val repository: MarketRepository,
) {
    suspend operator fun invoke(): List<MarketIndex> = repository.getMarketOverview()
}
