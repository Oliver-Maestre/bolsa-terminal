package com.bolsaterminal.domain.usecase

import com.bolsaterminal.core.model.BacktestResult
import com.bolsaterminal.domain.repository.SimulatorRepository
import javax.inject.Inject

class GetBacktestUseCase @Inject constructor(
    private val repository: SimulatorRepository,
) {
    suspend operator fun invoke(params: Map<String, String>): BacktestResult = repository.getBacktest(params)
}
