package com.bolsaterminal.domain.tax

import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID

/**
 * Frontend-only tax logic — no backend endpoint for this. Direct port of
 * frontend/src/components/simulator/TaxCalculator.tsx (matchFIFO, calcIRPF,
 * buildIRPFResult), mirroring macOS's IrpfCalculator.swift so all three
 * clients compute identical results.
 */

enum class TaxCurrency { EUR, USD }

data class TaxLotEntry(
    val id: String = UUID.randomUUID().toString(),
    val symbol: String,
    val buyDate: LocalDate,
    val buyPrice: Double,
    val quantity: Double,
    val currency: TaxCurrency,
    val eurRateAtBuy: Double,
)

data class TaxSaleEntry(
    val id: String = UUID.randomUUID().toString(),
    val symbol: String,
    val sellDate: LocalDate,
    val sellPrice: Double,
    val quantity: Double,
    val currency: TaxCurrency,
    val eurRateAtSell: Double,
)

data class FIFOMatch(
    val buyDate: LocalDate,
    val buyPriceEur: Double,
    val sellPriceEur: Double,
    val quantity: Double,
    val gainEur: Double,
    val holdDays: Long,
)

data class TaxTradeResult(
    val saleId: String,
    val symbol: String,
    val sellDate: LocalDate,
    val totalQuantity: Double,
    val totalGainEur: Double,
    val matches: List<FIFOMatch>,
    val washSaleWarning: Boolean,
)

data class IrpfBracket(
    val from: Double,
    val to: Double,
    val taxable: Double,
    val rate: Double,
    val tax: Double,
)

data class IrpfResult(
    val grossGain: Double = 0.0,
    val grossLoss: Double = 0.0,
    val netGain: Double = 0.0,
    val taxableBase: Double = 0.0,
    val totalTax: Double = 0.0,
    val netAfterTax: Double = 0.0,
    val effectiveRate: Double = 0.0,
    val brackets: List<IrpfBracket> = emptyList(),
    val carryForward: Double = 0.0,
)

object IrpfCalculator {
    // IRPF 2024 — base del ahorro (Spain)
    private val brackets = listOf(
        6_000.0 to 0.19,
        50_000.0 to 0.21,
        200_000.0 to 0.23,
        300_000.0 to 0.27,
        Double.POSITIVE_INFINITY to 0.28,
    )

    fun calcBrackets(netGain: Double): List<IrpfBracket> {
        if (netGain <= 0.0) return emptyList()
        var remaining = netGain
        var prev = 0.0
        val result = mutableListOf<IrpfBracket>()
        for ((upTo, rate) in brackets) {
            val taxable = minOf(remaining, upTo - prev)
            if (taxable <= 0.0) break
            result.add(IrpfBracket(from = prev, to = minOf(netGain, upTo), taxable = taxable, rate = rate, tax = taxable * rate))
            remaining -= taxable
            prev = upTo
            if (remaining <= 0.0) break
        }
        return result
    }

    fun buildResult(trades: List<TaxTradeResult>, carryForwardLoss: Double): IrpfResult {
        val gains = trades.filter { it.totalGainEur >= 0 }.sumOf { it.totalGainEur }
        val losses = trades.filter { it.totalGainEur < 0 }.sumOf { it.totalGainEur }
        val netBeforeCarry = gains + losses
        val netGain = maxOf(0.0, netBeforeCarry - carryForwardLoss)
        val newCarry = if (netBeforeCarry < 0) kotlin.math.abs(netBeforeCarry) else 0.0

        val calcedBrackets = calcBrackets(netGain)
        val totalTax = calcedBrackets.sumOf { it.tax }
        val effectiveRate = if (netGain > 0) (totalTax / netGain) * 100 else 0.0

        return IrpfResult(
            grossGain = maxOf(0.0, gains),
            grossLoss = kotlin.math.abs(losses),
            netGain = netBeforeCarry,
            taxableBase = netGain,
            totalTax = totalTax,
            netAfterTax = netBeforeCarry - totalTax,
            effectiveRate = effectiveRate,
            brackets = calcedBrackets,
            carryForward = newCarry,
        )
    }

    fun matchFIFO(lots: List<TaxLotEntry>, sale: TaxSaleEntry, defaultEurRate: Double = 1.08): TaxTradeResult {
        val sym = sale.symbol.uppercase()
        val sellPriceEur = if (sale.currency == TaxCurrency.EUR) {
            sale.sellPrice
        } else {
            sale.sellPrice / (sale.eurRateAtSell.takeIf { it > 0 } ?: defaultEurRate)
        }

        val symbolLots = lots.filter { it.symbol.uppercase() == sym }.sortedBy { it.buyDate }

        var remainingQty = sale.quantity
        val matches = mutableListOf<FIFOMatch>()

        for (lot in symbolLots) {
            if (remainingQty <= 0) break
            val usedQty = minOf(remainingQty, lot.quantity)
            val buyPriceEur = if (lot.currency == TaxCurrency.EUR) {
                lot.buyPrice
            } else {
                lot.buyPrice / (lot.eurRateAtBuy.takeIf { it > 0 } ?: defaultEurRate)
            }
            val gainEur = (sellPriceEur - buyPriceEur) * usedQty
            val holdDays = ChronoUnit.DAYS.between(lot.buyDate, sale.sellDate)

            matches.add(FIFOMatch(lot.buyDate, buyPriceEur, sellPriceEur, usedQty, gainEur, holdDays))
            remainingQty -= usedQty
        }

        val totalGainEur = matches.sumOf { it.gainEur }
        return TaxTradeResult(
            saleId = sale.id, symbol = sym, sellDate = sale.sellDate, totalQuantity = sale.quantity,
            totalGainEur = totalGainEur, matches = matches, washSaleWarning = totalGainEur < 0,
        )
    }
}
