package com.bolsaterminal.domain.tax

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalDate

class IrpfCalculatorTest {

    @Test
    fun `simple gain within first bracket taxed at 19 percent`() {
        val lot = TaxLotEntry(symbol = "AAPL", buyDate = LocalDate.of(2023, 1, 1), buyPrice = 100.0, quantity = 10.0, currency = TaxCurrency.EUR, eurRateAtBuy = 1.08)
        val sale = TaxSaleEntry(symbol = "AAPL", sellDate = LocalDate.of(2024, 1, 1), sellPrice = 150.0, quantity = 10.0, currency = TaxCurrency.EUR, eurRateAtSell = 1.08)

        val trade = IrpfCalculator.matchFIFO(listOf(lot), sale)
        assertEquals(500.0, trade.totalGainEur, 0.001)
        assertEquals(365L, trade.matches.first().holdDays)

        val irpf = IrpfCalculator.buildResult(listOf(trade), carryForwardLoss = 0.0)
        assertEquals(95.0, irpf.totalTax, 0.001) // 500 * 0.19
        assertEquals(19.0, irpf.effectiveRate, 0.001)
    }

    @Test
    fun `gain crossing two brackets sums both rates`() {
        val lot = TaxLotEntry(symbol = "MSFT", buyDate = LocalDate.of(2023, 1, 1), buyPrice = 0.0, quantity = 1.0, currency = TaxCurrency.EUR, eurRateAtBuy = 1.08)
        val sale = TaxSaleEntry(symbol = "MSFT", sellDate = LocalDate.of(2024, 1, 1), sellPrice = 10_000.0, quantity = 1.0, currency = TaxCurrency.EUR, eurRateAtSell = 1.08)

        val trade = IrpfCalculator.matchFIFO(listOf(lot), sale)
        val irpf = IrpfCalculator.buildResult(listOf(trade), carryForwardLoss = 0.0)

        val expectedTax = 6_000 * 0.19 + 4_000 * 0.21
        assertEquals(expectedTax, irpf.totalTax, 0.001)
        assertEquals(2, irpf.brackets.size)
    }
}
