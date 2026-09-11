import SwiftUI
import Charts

struct ComparisonView: View {
    @State private var viewModel = ComparisonViewModel()

    private let palette: [Color] = [.btAccent, .btGreen, .btOrange, .btRed, .btPurple, .btYellow]

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider().overlay(Color.btBorder)
            content
        }
        .background(Color.btBackground)
        .navigationTitle("Comparativa")
        .task { await viewModel.load() }
    }

    private var header: some View {
        HStack(spacing: 12) {
            TextField("Símbolos separados por coma", text: $viewModel.symbolsInput)
                .textFieldStyle(.roundedBorder)
                .frame(width: 260)
                .onSubmit { Task { await viewModel.load() } }

            Picker("Periodo", selection: $viewModel.period) {
                ForEach(ChartViewModel.periods, id: \.self) { period in
                    Text(period).tag(period)
                }
            }
            .pickerStyle(.segmented)
            .frame(width: 320)
            .onChange(of: viewModel.period) { _, _ in
                Task { await viewModel.load() }
            }

            Button("Comparar") { Task { await viewModel.load() } }
                .buttonStyle(.borderedProminent)

            Spacer()
        }
        .padding(16)
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .idle:
            Text("Introduce símbolos separados por coma y pulsa Comparar")
                .foregroundStyle(Color.btTextSecondary)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case .loading:
            ProgressView("Cargando comparativa…")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case .error(let message):
            ErrorBanner(message: message) { Task { await viewModel.load() } }
        case .loaded:
            chart
        }
    }

    /// Normalizes each series to % change from its first close so symbols
    /// with very different prices can be compared on one shared axis.
    private var chart: some View {
        let symbols = viewModel.series.keys.sorted()
        return Chart {
            ForEach(symbols, id: \.self) { symbol in
                let bars = viewModel.series[symbol] ?? []
                let base = bars.first?.close ?? 0
                ForEach(bars, id: \.time) { bar in
                    LineMark(
                        x: .value("Fecha", Date(timeIntervalSince1970: bar.time)),
                        y: .value("Cambio %", base > 0 ? ((bar.close - base) / base) * 100 : 0)
                    )
                    .foregroundStyle(by: .value("Símbolo", symbol))
                }
            }
        }
        .chartForegroundStyleScale(domain: symbols, range: symbols.indices.map { palette[$0 % palette.count] })
        .chartXAxis {
            AxisMarks { _ in
                AxisGridLine().foregroundStyle(Color.btBorder)
                AxisValueLabel(format: .dateTime.month(.abbreviated).day())
                    .foregroundStyle(Color.btTextSecondary)
            }
        }
        .chartYAxis {
            AxisMarks(position: .trailing) { _ in
                AxisGridLine().foregroundStyle(Color.btBorder)
                AxisValueLabel().foregroundStyle(Color.btTextSecondary)
            }
        }
        .padding(16)
    }
}
