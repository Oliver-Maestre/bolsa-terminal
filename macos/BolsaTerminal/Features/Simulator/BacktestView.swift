import SwiftUI
import Charts

struct BacktestView: View {
    @State private var viewModel = BacktestViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                form
                switch viewModel.state {
                case .idle:
                    EmptyView()
                case .loading:
                    ProgressView("Calculando…")
                case .error(let message):
                    ErrorBanner(message: message) { Task { await viewModel.run() } }
                case .loaded(let result):
                    resultView(result)
                }
            }
            .padding(20)
        }
    }

    private var form: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Simula una operación pasada con datos reales")
                .font(.caption).foregroundStyle(Color.btTextSecondary)
            HStack(spacing: 10) {
                TextField("Símbolo", text: $viewModel.symbol).frame(width: 90)
                DatePicker("Compra", selection: $viewModel.buyDate, displayedComponents: .date)
                Toggle("Hasta hoy", isOn: $viewModel.useToday)
                if !viewModel.useToday {
                    DatePicker("Venta", selection: $viewModel.sellDate, displayedComponents: .date)
                }
                TextField("Cantidad", text: $viewModel.quantity).frame(width: 70)
                Button("Calcular") { Task { await viewModel.run() } }
                    .buttonStyle(.borderedProminent)
            }
            .textFieldStyle(.roundedBorder)
        }
    }

    private func resultView(_ result: BacktestResult) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text(ratingLabel(result.rating))
                    .font(.headline)
                    .foregroundStyle(ratingColor(result.rating))
                Spacer()
                Text(result.pnl, format: .currency(code: "USD"))
                    .font(.system(.title3, design: .monospaced)).bold()
                    .foregroundStyle(result.pnl >= 0 ? Color.btGreen : Color.btRed)
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
                MetricTile(label: "Precio compra", value: result.buyPrice, isCurrency: true)
                MetricTile(label: "Precio venta", value: result.sellPrice, isCurrency: true)
                MetricTile(label: "Retorno", value: result.returnPct, isPercent: true, colored: true)
                MetricTile(label: "Retorno anualizado", value: result.annualizedReturn, isPercent: true, colored: true)
                if let alpha = result.alphaSPX {
                    MetricTile(label: "Alpha vs S&P500", value: alpha, isPercent: true, colored: true)
                }
                MetricTile(label: "Días en posición", value: Double(result.holdDays))
            }

            if !result.chart.isEmpty {
                Text("Evolución (base 100)").font(.headline).foregroundStyle(Color.btTextPrimary)
                Chart {
                    ForEach(result.chart, id: \.date) { point in
                        LineMark(x: .value("Fecha", point.date), y: .value(viewModel.symbol, point.symbol))
                            .foregroundStyle(by: .value("Serie", viewModel.symbol.uppercased()))
                        if let spx = point.spx {
                            LineMark(x: .value("Fecha", point.date), y: .value("S&P500", spx))
                                .foregroundStyle(by: .value("Serie", "S&P500"))
                        }
                        if let ibex = point.ibex {
                            LineMark(x: .value("Fecha", point.date), y: .value("IBEX35", ibex))
                                .foregroundStyle(by: .value("Serie", "IBEX35"))
                        }
                    }
                }
                .chartForegroundStyleScale([
                    viewModel.symbol.uppercased(): Color.btAccent, "S&P500": Color.btGreen, "IBEX35": Color.btOrange,
                ])
                .chartXAxis {
                    AxisMarks { _ in AxisValueLabel().foregroundStyle(Color.btTextSecondary) }
                }
                .chartYAxis {
                    AxisMarks(position: .trailing) { _ in
                        AxisGridLine().foregroundStyle(Color.btBorder)
                        AxisValueLabel().foregroundStyle(Color.btTextSecondary)
                    }
                }
                .frame(height: 240)
            }
        }
        .padding(14)
        .background(Color.btCard)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.btBorder, lineWidth: 1))
    }

    private func ratingLabel(_ rating: BacktestRating) -> String {
        switch rating {
        case .excellent: return "🏆 Excelente operación"
        case .good: return "✅ Buena operación"
        case .neutral: return "➖ Operación neutra"
        case .poor: return "⚠️ Operación pobre"
        case .bad: return "❌ Mala operación"
        }
    }

    private func ratingColor(_ rating: BacktestRating) -> Color {
        switch rating {
        case .excellent, .good: return .btGreen
        case .neutral: return .btTextSecondary
        case .poor: return .btYellow
        case .bad: return .btRed
        }
    }
}
