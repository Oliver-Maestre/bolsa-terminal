import SwiftUI

struct BrokerView: View {
    @State private var viewModel = BrokerViewModel()

    var body: some View {
        Group {
            switch viewModel.state {
            case .idle, .loading:
                ProgressView("Cargando cuenta…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            case .error(let message):
                ErrorBanner(message: message) { Task { await viewModel.load() } }
            case .loaded:
                if let account = viewModel.account {
                    content(account)
                }
            }
        }
        .background(Color.btBackground)
        .navigationTitle("Broker")
        .task { await viewModel.load() }
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

    private func content(_ account: BrokerAccount) -> some View {
        ScrollView {
            HStack(alignment: .top, spacing: 16) {
                VStack(alignment: .leading, spacing: 20) {
                    AccountSummary(account: account) {
                        Task { await viewModel.reset() }
                    }
                    OpenPositionsList(positions: account.positions) { symbol in
                        Task { await viewModel.sellAll(symbol) }
                    }
                    TradeHistoryList(orders: account.orders)
                }
                .frame(maxWidth: .infinity)

                TradingPanel(viewModel: viewModel) {
                    Task { await viewModel.submitOrder() }
                }
                .frame(width: 280)
            }
            .padding(20)
        }
    }
}
