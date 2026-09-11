package com.bolsaterminal.domain.usecase

import com.bolsaterminal.core.model.ScreenerItem
import com.bolsaterminal.domain.repository.MarketRepository
import javax.inject.Inject

class GetScreenerUseCase @Inject constructor(
    private val repository: MarketRepository,
) {
    suspend operator fun invoke(params: Map<String, String> = emptyMap()): List<ScreenerItem> =
        repository.getScreener(params)
}
