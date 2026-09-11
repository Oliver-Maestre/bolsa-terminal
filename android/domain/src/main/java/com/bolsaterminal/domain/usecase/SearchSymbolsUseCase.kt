package com.bolsaterminal.domain.usecase

import com.bolsaterminal.core.model.SearchResult
import com.bolsaterminal.domain.repository.MarketRepository
import javax.inject.Inject

class SearchSymbolsUseCase @Inject constructor(
    private val repository: MarketRepository,
) {
    suspend operator fun invoke(query: String): List<SearchResult> = repository.search(query)
}
