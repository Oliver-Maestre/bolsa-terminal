import SwiftUI
import Charts

struct ProjectionView: View {
    @State private var viewModel = ProjectionViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                form
                switch viewModel.state {
                case .idle:
                    EmptyView()
                case .loading:
                    ProgressView("Simulando 2.000 escenarios…")
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
            Text("Proyecta tu inversión a futuro mediante 2.000 simulaciones de Monte Carlo")
                .font(.caption).foregroundStyle(Color.btTextSecondary)
            HStack(spacing: 10) {
                TextField("Símbolo", text: $viewModel.symbol).frame(width: 90)
                TextField("Importe a invertir", text: $viewModel.amount).frame(width: 120)
                Button("Proyectar") { Task { await viewModel.run() } }
                    .buttonStyle(.borderedProminent)
            }
            .textFieldStyle(.roundedBorder)
        }
    }

    private func resultView(_ result: ProjectionResult) -> some View {
        let horizons = result.projections.sorted { $0.days < $1.days }

        return VStack(alignment: .leading, spacing: 16) {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
                MetricTile(label: "Precio actual", value: result.currentPrice, isCurrency: true)
                MetricTile(label: "Acciones", value: result.shares)
                MetricTile(label: "Retorno histórico anual", value: result.annualReturn, isPercent: true, colored: true)
                MetricTile(label: "Volatilidad anual", value: result.annualVol, isPercent: true)
            }

            Text("Proyección de valor").font(.headline).foregroundStyle(Color.btTextPrimary)
            Chart {
                ForEach(horizons) { h in
                    AreaMark(
                        x: .value("Horizonte", h.label), yStart: .value("P5", h.p5), yEnd: .value("P95", h.p95)
                    )
                    .foregroundStyle(Color.btAccent.opacity(0.15))
                    AreaMark(
                        x: .value("Horizonte", h.label), yStart: .value("P25", h.p25), yEnd: .value("P75", h.p75)
                    )
                    .foregroundStyle(Color.btAccent.opacity(0.3))
                    LineMark(x: .value("Horizonte", h.label), y: .value("Mediana", h.p50))
                        .foregroundStyle(Color.btAccentLight)
                        .symbol(Circle())
                }
                RuleMark(y: .value("Inversión", result.investment))
                    .foregroundStyle(Color.btTextSecondary)
                    .lineStyle(StrokeStyle(dash: [4, 4]))
            }
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

            HStack(spacing: 16) {
                legend(color: Color.btAccent.opacity(0.15), label: "Zona P5–P95")
                legend(color: Color.btAccent.opacity(0.3), label: "Zona P25–P75")
                legend(color: Color.btAccentLight, label: "Mediana (P50)")
            }

            table(horizons)
        }
        .padding(14)
        .background(Color.btCard)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.btBorder, lineWidth: 1))
    }

    private func legend(color: Color, label: String) -> some View {
        HStack(spacing: 5) {
            Circle().fill(color).frame(width: 8, height: 8)
            Text(label).font(.caption2).foregroundStyle(Color.btTextSecondary)
        }
    }

    private func table(_ horizons: [ProjectionHorizon]) -> some View {
        VStack(spacing: 0) {
            ForEach(horizons) { h in
                HStack {
                    Text(h.label).font(.system(.caption, design: .monospaced)).bold().frame(width: 60, alignment: .leading)
                    Text("P50: \(h.p50, format: .currency(code: "USD"))").font(.caption2)
                    Spacer()
                    Text("Prob. beneficio: \(h.probProfit, format: .number.precision(.fractionLength(0)))%")
                        .font(.caption2).foregroundStyle(h.probProfit >= 50 ? Color.btGreen : Color.btRed)
                }
                .padding(.horizontal, 10).padding(.vertical, 6)
                Divider().overlay(Color.btBorder)
            }
        }
    }
}
