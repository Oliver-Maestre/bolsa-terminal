import Foundation

/// Frontend-only tax logic — no backend endpoint for this. Direct port of
/// frontend/src/components/simulator/TaxCalculator.tsx (matchFIFO, calcIRPF,
/// buildIRPFResult) so the two stay behaviourally identical.

enum TaxCurrency: String, CaseIterable {
    case eur = "EUR"
    case usd = "USD"
}

struct TaxLotEntry: Identifiable, Hashable {
    let id = UUID()
    var symbol: String
    var buyDate: Date
    var buyPrice: Double
    var quantity: Double
    var currency: TaxCurrency
    var eurRateAtBuy: Double
}

struct TaxSaleEntry: Identifiable, Hashable {
    let id = UUID()
    var symbol: String
    var sellDate: Date
    var sellPrice: Double
    var quantity: Double
    var currency: TaxCurrency
    var eurRateAtSell: Double
}

struct FIFOMatchCalc: Identifiable, Hashable {
    let id = UUID()
    let buyDate: Date
    let buyPriceEur: Double
    let sellPriceEur: Double
    let quantity: Double
    let gainEur: Double
    let holdDays: Int
}

struct TaxTradeResultCalc: Identifiable, Hashable {
    var id: UUID { saleId }
    let saleId: UUID
    let symbol: String
    let sellDate: Date
    let totalQuantity: Double
    let totalGainEur: Double
    let matches: [FIFOMatchCalc]
    let washSaleWarning: Bool
}

struct IrpfBracketCalc: Identifiable, Hashable {
    var id: Double { from }
    let from: Double
    let to: Double
    let taxable: Double
    let rate: Double
    let tax: Double
}

struct IrpfResultCalc {
    var grossGain: Double = 0
    var grossLoss: Double = 0
    var netGain: Double = 0
    var taxableBase: Double = 0
    var totalTax: Double = 0
    var netAfterTax: Double = 0
    var effectiveRate: Double = 0
    var brackets: [IrpfBracketCalc] = []
    var carryForward: Double = 0
}

enum IrpfCalculator {
    // IRPF 2024 — base del ahorro (Spain)
    private static let brackets: [(upTo: Double, rate: Double)] = [
        (6_000, 0.19), (50_000, 0.21), (200_000, 0.23), (300_000, 0.27), (.infinity, 0.28),
    ]

    static func calcBrackets(netGain: Double) -> [IrpfBracketCalc] {
        guard netGain > 0 else { return [] }
        var remaining = netGain
        var prev = 0.0
        var result: [IrpfBracketCalc] = []
        for b in brackets {
            let taxable = min(remaining, b.upTo - prev)
            if taxable <= 0 { break }
            result.append(IrpfBracketCalc(from: prev, to: min(netGain, b.upTo), taxable: taxable, rate: b.rate, tax: taxable * b.rate))
            remaining -= taxable
            prev = b.upTo
            if remaining <= 0 { break }
        }
        return result
    }

    static func buildResult(trades: [TaxTradeResultCalc], carryForwardLoss: Double) -> IrpfResultCalc {
        let gains = trades.filter { $0.totalGainEur >= 0 }.reduce(0) { $0 + $1.totalGainEur }
        let losses = trades.filter { $0.totalGainEur < 0 }.reduce(0) { $0 + $1.totalGainEur }
        let netBeforeCarry = gains + losses
        let netGain = max(0, netBeforeCarry - carryForwardLoss)
        let newCarry = netBeforeCarry < 0 ? abs(netBeforeCarry) : 0

        let calcedBrackets = calcBrackets(netGain: netGain)
        let totalTax = calcedBrackets.reduce(0) { $0 + $1.tax }
        let effectiveRate = netGain > 0 ? (totalTax / netGain) * 100 : 0

        return IrpfResultCalc(
            grossGain: max(0, gains),
            grossLoss: abs(losses),
            netGain: netBeforeCarry,
            taxableBase: netGain,
            totalTax: totalTax,
            netAfterTax: netBeforeCarry - totalTax,
            effectiveRate: effectiveRate,
            brackets: calcedBrackets,
            carryForward: newCarry
        )
    }

    static func matchFIFO(lots: [TaxLotEntry], sale: TaxSaleEntry, defaultEurRate: Double = 1.08) -> TaxTradeResultCalc {
        let sym = sale.symbol.uppercased()
        let sellPriceEur = sale.currency == .eur
            ? sale.sellPrice
            : sale.sellPrice / (sale.eurRateAtSell > 0 ? sale.eurRateAtSell : defaultEurRate)

        let symbolLots = lots
            .filter { $0.symbol.uppercased() == sym }
            .sorted { $0.buyDate < $1.buyDate }

        var remainingQty = sale.quantity
        var matches: [FIFOMatchCalc] = []

        for lot in symbolLots {
            if remainingQty <= 0 { break }
            let usedQty = min(remainingQty, lot.quantity)
            let buyPriceEur = lot.currency == .eur
                ? lot.buyPrice
                : lot.buyPrice / (lot.eurRateAtBuy > 0 ? lot.eurRateAtBuy : defaultEurRate)
            let gainEur = (sellPriceEur - buyPriceEur) * usedQty
            let holdDays = Int((sale.sellDate.timeIntervalSince(lot.buyDate) / 86400).rounded())

            matches.append(FIFOMatchCalc(
                buyDate: lot.buyDate, buyPriceEur: buyPriceEur, sellPriceEur: sellPriceEur,
                quantity: usedQty, gainEur: gainEur, holdDays: holdDays
            ))
            remainingQty -= usedQty
        }

        let totalGainEur = matches.reduce(0) { $0 + $1.gainEur }
        return TaxTradeResultCalc(
            saleId: sale.id, symbol: sym, sellDate: sale.sellDate, totalQuantity: sale.quantity,
            totalGainEur: totalGainEur, matches: matches, washSaleWarning: totalGainEur < 0
        )
    }
}
