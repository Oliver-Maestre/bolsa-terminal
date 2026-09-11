import Foundation
import Observation

@MainActor
@Observable
final class TaxCalculatorViewModel {
    var lots: [TaxLotEntry] = []
    var sales: [TaxSaleEntry] = []
    var carryForward: String = "0"

    var tradeResults: [TaxTradeResultCalc] {
        sales.map { IrpfCalculator.matchFIFO(lots: lots, sale: $0) }
    }

    var irpf: IrpfResultCalc {
        IrpfCalculator.buildResult(trades: tradeResults, carryForwardLoss: Double(carryForward) ?? 0)
    }

    func addLot(symbol: String, buyDate: Date, buyPrice: Double, quantity: Double, currency: TaxCurrency, eurRateAtBuy: Double) {
        lots.append(TaxLotEntry(
            symbol: symbol.uppercased(), buyDate: buyDate, buyPrice: buyPrice, quantity: quantity,
            currency: currency, eurRateAtBuy: eurRateAtBuy > 0 ? eurRateAtBuy : 1.08
        ))
    }

    func addSale(symbol: String, sellDate: Date, sellPrice: Double, quantity: Double, currency: TaxCurrency, eurRateAtSell: Double) {
        sales.append(TaxSaleEntry(
            symbol: symbol.uppercased(), sellDate: sellDate, sellPrice: sellPrice, quantity: quantity,
            currency: currency, eurRateAtSell: eurRateAtSell > 0 ? eurRateAtSell : 1.08
        ))
    }

    func removeLot(_ id: TaxLotEntry.ID) {
        lots.removeAll { $0.id == id }
    }

    func removeSale(_ id: TaxSaleEntry.ID) {
        sales.removeAll { $0.id == id }
    }
}
