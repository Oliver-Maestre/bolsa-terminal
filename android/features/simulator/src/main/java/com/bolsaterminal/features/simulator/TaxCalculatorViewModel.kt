package com.bolsaterminal.features.simulator

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.bolsaterminal.domain.tax.IrpfCalculator
import com.bolsaterminal.domain.tax.IrpfResult
import com.bolsaterminal.domain.tax.TaxCurrency
import com.bolsaterminal.domain.tax.TaxLotEntry
import com.bolsaterminal.domain.tax.TaxSaleEntry
import com.bolsaterminal.domain.tax.TaxTradeResult
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.LocalDate
import javax.inject.Inject

@HiltViewModel
class TaxCalculatorViewModel @Inject constructor() : ViewModel() {

    val lots = mutableStateListOf<TaxLotEntry>()
    val sales = mutableStateListOf<TaxSaleEntry>()
    var carryForwardText by mutableStateOf("0")

    val tradeResults: List<TaxTradeResult>
        get() = sales.map { IrpfCalculator.matchFIFO(lots, it) }

    val irpf: IrpfResult
        get() = IrpfCalculator.buildResult(tradeResults, carryForwardText.toDoubleOrNull() ?: 0.0)

    fun addLot(symbol: String, buyDate: LocalDate, buyPrice: Double, quantity: Double, currency: TaxCurrency, eurRate: Double) {
        lots.add(TaxLotEntry(symbol = symbol.uppercase(), buyDate = buyDate, buyPrice = buyPrice, quantity = quantity, currency = currency, eurRateAtBuy = if (eurRate > 0) eurRate else 1.08))
    }

    fun addSale(symbol: String, sellDate: LocalDate, sellPrice: Double, quantity: Double, currency: TaxCurrency, eurRate: Double) {
        sales.add(TaxSaleEntry(symbol = symbol.uppercase(), sellDate = sellDate, sellPrice = sellPrice, quantity = quantity, currency = currency, eurRateAtSell = if (eurRate > 0) eurRate else 1.08))
    }

    fun removeLot(id: String) {
        lots.removeAll { it.id == id }
    }

    fun removeSale(id: String) {
        sales.removeAll { it.id == id }
    }
}
