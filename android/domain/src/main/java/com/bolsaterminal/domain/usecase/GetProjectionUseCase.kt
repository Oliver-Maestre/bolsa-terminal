package com.bolsaterminal.domain.usecase

import com.bolsaterminal.core.model.ProjectionResult
import com.bolsaterminal.domain.repository.SimulatorRepository
import javax.inject.Inject

class GetProjectionUseCase @Inject constructor(
    private val repository: SimulatorRepository,
) {
    suspend operator fun invoke(params: Map<String, String>): ProjectionResult = repository.getProjection(params)
}
