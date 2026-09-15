import SwiftUI

struct ChartView: View {
    @State private var viewModel = ChartViewModel()
    @FocusState private var searchFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider().overlay(Color.btBorder)
            content
        }
        .background(Color.btBackground)
        .navigationTitle("Gráfico")
        .task { await viewModel.load() }
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(60))
                await viewModel.refresh()
            }
        }
    }

    private var header: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 0) {
                TextField("Símbolo (ej. AAPL)", text: $viewModel.searchQuery)
                    .textFieldStyle(.roundedBorder)
                    .frame(width: 220)
                    .focused($searchFocused)
                    .onChange(of: viewModel.searchQuery) { _, newValue in
                        viewModel.search(newValue)
                    }
                    .onSubmit {
                        Task { await viewModel.load(symbol: viewModel.searchQuery) }
                    }

                if searchFocused && !viewModel.searchResults.isEmpty {
                    searchDropdown
                }
            }

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

            Spacer()

            Text(viewModel.symbol)
                .font(.system(.title2, design: .monospaced)).bold()
                .foregroundStyle(Color.btTextPrimary)
        }
        .padding(16)
    }

    private var searchDropdown: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(viewModel.searchResults.prefix(6)) { result in
                Button {
                    viewModel.searchQuery = result.symbol
                    searchFocused = false
                    Task { await viewModel.load(symbol: result.symbol) }
                } label: {
                    HStack {
                        Text(result.symbol)
                            .font(.system(.caption, design: .monospaced)).bold()
                        Text(result.shortname)
                            .font(.caption2)
                            .foregroundStyle(Color.btTextSecondary)
                            .lineLimit(1)
                        Spacer()
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .background(Color.btCard)
        .clipShape(RoundedRectangle(cornerRadius: 6))
        .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.btBorder, lineWidth: 1))
        .frame(width: 260)
        .zIndex(1)
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .idle, .loading:
            ProgressView("Cargando gráfico…")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case .error(let message):
            ErrorBanner(message: message) { Task { await viewModel.load() } }
        case .loaded:
            if let history = viewModel.history {
                chartContent(history)
            }
        }
    }

    private func chartContent(_ history: HistoryResponse) -> some View {
        let dates = history.bars.map { Date(timeIntervalSince1970: $0.time) }
        return ScrollView {
            HStack(alignment: .top, spacing: 16) {
                VStack(spacing: 8) {
                    CandlestickChart(bars: history.bars)
                        .frame(height: 320)
                    VolumeChart(bars: history.bars)
                        .frame(height: 90)
                    IndicatorLineChart(
                        title: "RSI (14)", dates: dates, values: history.indicators.rsi,
                        color: .btAccent, referenceLines: [30, 70]
                    )
                    IndicatorLineChart(
                        title: "MACD Histograma", dates: dates, values: history.indicators.macdHistogram,
                        color: .btAccent
                    )
                    IndicatorLineChart(
                        title: "Bollinger %B", dates: dates, values: history.indicators.bbPercent,
                        color: .btAccent, referenceLines: [0, 1]
                    )
                }
                .frame(maxWidth: .infinity)

                RecommendationCard(recommendation: history.recommendation)
                    .frame(width: 280)
            }
            .padding(16)
        }
    }
}
