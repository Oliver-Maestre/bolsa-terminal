import SwiftUI

struct ScreenerView: View {
    @State private var viewModel = ScreenerViewModel()

    var body: some View {
        Group {
            switch viewModel.state {
            case .idle, .loading:
                ProgressView("Cargando screener…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            case .error(let message):
                ErrorBanner(message: message) { Task { await viewModel.load() } }
            case .loaded:
                table
            }
        }
        .background(Color.btBackground)
        .navigationTitle("Screener")
        .searchable(text: $viewModel.searchText, prompt: "Buscar símbolo…")
        .task { await viewModel.load() }
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(60))
                await viewModel.refresh()
            }
        }
        .toolbar {
            ToolbarItem {
                Button {
                    Task { await viewModel.load() }
                } label: {
                    Label("Actualizar", systemImage: "arrow.clockwise")
                }
            }
        }
    }

    private var table: some View {
        Table(viewModel.filteredItems) {
            TableColumn("Símbolo") { item in
                Text(item.symbol).font(.system(.body, design: .monospaced)).bold()
            }
            TableColumn("Nombre") { item in
                Text(item.shortName).foregroundStyle(Color.btTextSecondary)
            }
            TableColumn("Precio") { item in
                Text(item.price, format: .number.precision(.fractionLength(2)))
                    .font(.system(.body, design: .monospaced))
            }
            TableColumn("Cambio %") { item in
                Text(item.changePercent / 100, format: .percent.precision(.fractionLength(2)))
                    .foregroundStyle(item.changePercent >= 0 ? Color.btGreen : Color.btRed)
                    .font(.system(.body, design: .monospaced))
            }
            TableColumn("RSI") { item in
                Text(item.rsi, format: .number.precision(.fractionLength(1)))
                    .font(.system(.body, design: .monospaced))
            }
            TableColumn("Señal") { item in
                SignalBadge(signal: item.signal)
            }
        }
    }
}
