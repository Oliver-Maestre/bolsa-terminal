package com.bolsaterminal.domain.usecase

import com.bolsaterminal.core.model.ScreenerItem
import com.bolsaterminal.core.model.SignalType
import com.bolsaterminal.domain.repository.MarketRepository
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class GetScreenerUseCaseTest {

    private val sample = ScreenerItem(
        symbol = "AAPL", shortName = "Apple", exchange = "NASDAQ", sector = "Tech",
        quoteType = "EQUITY", price = 150.0, change = 1.5, changePercent = 1.0,
        volume = 1_000_000.0, marketCap = null, rsi = 55.0, macdHistogram = 0.1,
        bbPercent = 0.5, signal = SignalType.Buy, score = 3.0, sparkline = listOf(148.0, 149.0, 150.0),
    )

    @Test
    fun `invoke returns items from repository`() = runTest {
        val repository = mock<MarketRepository>()
        whenever(repository.getScreener(emptyMap())).thenReturn(listOf(sample))

        val useCase = GetScreenerUseCase(repository)
        val result = useCase()

        assertEquals(1, result.size)
        assertEquals("AAPL", result.first().symbol)
    }
}
