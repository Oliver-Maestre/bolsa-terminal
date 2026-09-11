import SwiftUI

struct DashboardView: View {
    @State private var viewModel = DashboardViewModel()

    var body: some View {
        Group {
            switch viewModel.state {
            case .idle, .loading:
                ProgressView("Cargando mercados…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            case .error(let message):
                ErrorBanner(message: message) { Task { await viewModel.load() } }
            case .loaded:
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        marketOverviewSection
                        topMoversSection
                    }
                    .padding(20)
                }
            }
        }
        .background(Color.btBackground)
        .navigationTitle("Dashboard")
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

    private var marketOverviewSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Mercados")
                .font(.headline)
                .foregroundStyle(Color.btTextPrimary)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 180), spacing: 12)], spacing: 12) {
                ForEach(viewModel.indices) { index in
                    MarketIndexCard(index: index)
                }
            }
        }
    }

    private var topMoversSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Mayor movimiento")
                .font(.headline)
                .foregroundStyle(Color.btTextPrimary)
            VStack(spacing: 0) {
                ForEach(viewModel.topMovers) { item in
                    ScreenerRow(item: item)
                    if item.id != viewModel.topMovers.last?.id {
                        Divider().overlay(Color.btBorder)
                    }
                }
            }
            .background(Color.btCard)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.btBorder, lineWidth: 1))
        }
    }
}
