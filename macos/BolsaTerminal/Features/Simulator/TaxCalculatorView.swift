import SwiftUI

struct TaxCalculatorView: View {
    @State private var viewModel = TaxCalculatorViewModel()
    @State private var tab: Tab = .lots

    private enum Tab: String, CaseIterable {
        case lots = "1. Compras"
        case sales = "2. Ventas"
        case result = "3. Resultado fiscal"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Picker("", selection: $tab) {
                ForEach(Tab.allCases, id: \.self) { Text($0.rawValue).tag($0) }
            }
            .pickerStyle(.segmented)
            .labelsHidden()

            switch tab {
            case .lots: lotsTab
            case .sales: salesTab
            case .result: resultTab
            }
        }
        .padding(20)
    }

    // MARK: - Lots

    private var lotsTab: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Introduce tus compras (lotes) — FIFO en orden de entrada")
                .font(.caption).foregroundStyle(Color.btTextSecondary)
            LotForm { symbol, date, price, qty, currency, rate in
                viewModel.addLot(symbol: symbol, buyDate: date, buyPrice: price, quantity: qty, currency: currency, eurRateAtBuy: rate)
            }
            if !viewModel.lots.isEmpty {
                VStack(spacing: 0) {
                    ForEach(viewModel.lots) { lot in
                        HStack {
                            Text(lot.symbol).font(.system(.caption, design: .monospaced)).bold().frame(width: 60, alignment: .leading)
                            Text(lot.buyDate, style: .date).font(.caption2).foregroundStyle(Color.btTextSecondary)
                            Spacer()
                            Text("\(lot.currency == .eur ? "€" : "$")\(lot.buyPrice, format: .number.precision(.fractionLength(2))) × \(lot.quantity, format: .number)")
                                .font(.system(.caption, design: .monospaced))
                            Button {
                                viewModel.removeLot(lot.id)
                            } label: { Image(systemName: "trash").foregroundStyle(Color.btRed) }
                                .buttonStyle(.plain)
                        }
                        .padding(.horizontal, 10).padding(.vertical, 6)
                        Divider().overlay(Color.btBorder)
                    }
                }
                .background(Color.btCard)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.btBorder, lineWidth: 1))
            }
        }
    }

    // MARK: - Sales

    private var salesTab: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Introduce tus ventas del ejercicio fiscal")
                .font(.caption).foregroundStyle(Color.btTextSecondary)
            SaleForm { symbol, date, price, qty, currency, rate in
                viewModel.addSale(symbol: symbol, sellDate: date, sellPrice: price, quantity: qty, currency: currency, eurRateAtSell: rate)
            }
            if !viewModel.sales.isEmpty {
                VStack(spacing: 0) {
                    ForEach(viewModel.sales) { sale in
                        HStack {
                            Text(sale.symbol).font(.system(.caption, design: .monospaced)).bold().frame(width: 60, alignment: .leading)
                            Text(sale.sellDate, style: .date).font(.caption2).foregroundStyle(Color.btTextSecondary)
                            Spacer()
                            Text("\(sale.currency == .eur ? "€" : "$")\(sale.sellPrice, format: .number.precision(.fractionLength(2))) × \(sale.quantity, format: .number)")
                                .font(.system(.caption, design: .monospaced))
                            Button {
                                viewModel.removeSale(sale.id)
                            } label: { Image(systemName: "trash").foregroundStyle(Color.btRed) }
                                .buttonStyle(.plain)
                        }
                        .padding(.horizontal, 10).padding(.vertical, 6)
                        Divider().overlay(Color.btBorder)
                    }
                }
                .background(Color.btCard)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.btBorder, lineWidth: 1))
            }
        }
    }

    // MARK: - Result

    private var resultTab: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if viewModel.tradeResults.isEmpty {
                    Text("Añade compras y ventas en las pestañas anteriores")
                        .foregroundStyle(Color.btTextSecondary)
                } else {
                    HStack {
                        Text("Pérdidas pendientes de ejercicios anteriores (€)")
                            .font(.caption).foregroundStyle(Color.btTextSecondary)
                        TextField("0", text: $viewModel.carryForward)
                            .textFieldStyle(.roundedBorder)
                            .frame(width: 100)
                    }

                    ForEach(viewModel.tradeResults) { tr in
                        tradeCard(tr)
                    }

                    irpfSummary
                }
            }
        }
    }

    private func tradeCard(_ tr: TaxTradeResultCalc) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(tr.symbol).font(.system(.body, design: .monospaced)).bold()
                Text(tr.sellDate, style: .date).font(.caption2).foregroundStyle(Color.btTextSecondary)
                Spacer()
                Text(tr.totalGainEur, format: .currency(code: "EUR"))
                    .font(.system(.body, design: .monospaced)).bold()
                    .foregroundStyle(tr.totalGainEur >= 0 ? Color.btGreen : Color.btRed)
                if tr.washSaleWarning {
                    Label("Regla 2 meses", systemImage: "exclamationmark.triangle")
                        .font(.caption2).foregroundStyle(Color.btYellow)
                }
            }
            ForEach(tr.matches) { m in
                HStack {
                    Text(m.buyDate, style: .date).font(.caption2).foregroundStyle(Color.btTextSecondary)
                    Text("\(m.buyPriceEur, format: .currency(code: "EUR")) → \(m.sellPriceEur, format: .currency(code: "EUR"))")
                        .font(.system(.caption2, design: .monospaced))
                    Spacer()
                    Text("\(m.holdDays)d \(m.holdDays < 365 ? "CP" : "LP")")
                        .font(.caption2).foregroundStyle(Color.btTextMuted)
                    Text(m.gainEur, format: .currency(code: "EUR"))
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(m.gainEur >= 0 ? Color.btGreen : Color.btRed)
                }
            }
        }
        .padding(10)
        .background(Color.btCard)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.btBorder, lineWidth: 1))
    }

    private var irpfSummary: some View {
        let irpf = viewModel.irpf
        return VStack(alignment: .leading, spacing: 8) {
            Text("Resultado IRPF 2024 — Base del ahorro").font(.headline).foregroundStyle(Color.btTextPrimary)
            row("Ganancias brutas", irpf.grossGain, color: .btGreen)
            row("Pérdidas del ejercicio", -irpf.grossLoss, color: .btRed)
            row("Base imponible del ahorro", irpf.taxableBase)
            ForEach(irpf.brackets) { b in
                HStack {
                    Text("\(b.from, format: .currency(code: "EUR")) – \(b.to.isInfinite ? "∞" : b.to.formatted(.currency(code: "EUR"))) → \(Int(b.rate * 100))%")
                        .font(.caption2).foregroundStyle(Color.btTextMuted)
                    Spacer()
                    Text(b.tax, format: .currency(code: "EUR")).font(.system(.caption2, design: .monospaced))
                }
            }
            Divider().overlay(Color.btBorder)
            row("Cuota a ingresar (IRPF)", irpf.totalTax, color: .btRed)
            row("Tipo efectivo", irpf.effectiveRate, isPercent: true)
            row("Ganancia neta tras impuestos", irpf.netAfterTax, color: irpf.netAfterTax >= 0 ? .btGreen : .btRed)
            if irpf.carryForward > 0 {
                row("Pérdidas pendientes (trasladar 4 años)", irpf.carryForward, color: .btYellow)
            }

            Text("Calculadora orientativa. Método FIFO y regla de los 2 meses (Art. 33.5 LIRPF). Consulta a un asesor fiscal para tu declaración oficial.")
                .font(.caption2)
                .foregroundStyle(Color.btTextMuted)
                .padding(.top, 8)
        }
        .padding(14)
        .background(Color.btCard)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.btBorder, lineWidth: 1))
    }

    private func row(_ label: String, _ value: Double, color: Color = .btTextPrimary, isPercent: Bool = false) -> some View {
        HStack {
            Text(label).font(.caption).foregroundStyle(Color.btTextSecondary)
            Spacer()
            Text(isPercent ? String(format: "%.2f%%", value) : value.formatted(.currency(code: "EUR")))
                .font(.system(.body, design: .monospaced)).foregroundStyle(color)
        }
    }
}

private struct LotForm: View {
    let onAdd: (String, Date, Double, Double, TaxCurrency, Double) -> Void

    @State private var symbol = ""
    @State private var date = Date()
    @State private var price = ""
    @State private var quantity = ""
    @State private var currency: TaxCurrency = .eur
    @State private var eurRate = "1.08"

    var body: some View {
        HStack(spacing: 8) {
            TextField("Símbolo", text: $symbol).frame(width: 80)
            DatePicker("", selection: $date, displayedComponents: .date).labelsHidden()
            TextField("Precio", text: $price).frame(width: 70)
            TextField("Cantidad", text: $quantity).frame(width: 70)
            Picker("", selection: $currency) {
                ForEach(TaxCurrency.allCases, id: \.self) { Text($0.rawValue).tag($0) }
            }.frame(width: 70).labelsHidden()
            if currency == .usd {
                TextField("€/$", text: $eurRate).frame(width: 50)
            }
            Button {
                guard let p = Double(price), let q = Double(quantity), !symbol.isEmpty else { return }
                onAdd(symbol, date, p, q, currency, Double(eurRate) ?? 1.08)
                symbol = ""; price = ""; quantity = ""
            } label: { Image(systemName: "plus.circle.fill") }
                .buttonStyle(.plain)
        }
        .textFieldStyle(.roundedBorder)
    }
}

private struct SaleForm: View {
    let onAdd: (String, Date, Double, Double, TaxCurrency, Double) -> Void

    @State private var symbol = ""
    @State private var date = Date()
    @State private var price = ""
    @State private var quantity = ""
    @State private var currency: TaxCurrency = .eur
    @State private var eurRate = "1.08"

    var body: some View {
        HStack(spacing: 8) {
            TextField("Símbolo", text: $symbol).frame(width: 80)
            DatePicker("", selection: $date, displayedComponents: .date).labelsHidden()
            TextField("Precio", text: $price).frame(width: 70)
            TextField("Cantidad", text: $quantity).frame(width: 70)
            Picker("", selection: $currency) {
                ForEach(TaxCurrency.allCases, id: \.self) { Text($0.rawValue).tag($0) }
            }.frame(width: 70).labelsHidden()
            if currency == .usd {
                TextField("€/$", text: $eurRate).frame(width: 50)
            }
            Button {
                guard let p = Double(price), let q = Double(quantity), !symbol.isEmpty else { return }
                onAdd(symbol, date, p, q, currency, Double(eurRate) ?? 1.08)
                symbol = ""; price = ""; quantity = ""
            } label: { Image(systemName: "plus.circle.fill") }
                .buttonStyle(.plain)
        }
        .textFieldStyle(.roundedBorder)
    }
}
