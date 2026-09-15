import SwiftUI
import SwiftData
import Charts

struct PortfolioView: View {
    @Query(sort: \PortfolioPositionEntity.addedAt, order: .reverse) private var positions: [PortfolioPositionEntity]
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel = PortfolioViewModel()
    @State private var showAddSheet = false
    @State private var editingPosition: PortfolioPositionEntity?

    var body: some View {
        Group {
            if positions.isEmpty {
                emptyState
            } else {
                content
            }
        }
        .background(Color.btBackground)
        .navigationTitle("Cartera")
        .task { await viewModel.refreshQuotes(for: positions) }
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(60))
                await viewModel.refresh(for: positions)
            }
        }
        .toolbar {
            ToolbarItem {
                Button {
                    showAddSheet = true
                } label: {
                    Label("Añadir posición", systemImage: "plus")
                }
            }
        }
        .sheet(isPresented: $showAddSheet) {
            PositionFormView(onSave: addPosition)
        }
        .sheet(item: $editingPosition) { position in
            PositionFormView(existing: position) { symbol, name, quantity, avgCost in
                position.symbol = symbol
                position.name = name
                position.quantity = quantity
                position.avgCost = avgCost
                try? modelContext.save()
                Task { await viewModel.refreshQuotes(for: positions) }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "briefcase")
                .font(.system(size: 40))
                .foregroundStyle(Color.btTextSecondary)
            Text("Sin posiciones todavía")
                .font(.title3.bold())
                .foregroundStyle(Color.btTextPrimary)
            Text("Añade tus holdings reales para hacer seguimiento")
                .foregroundStyle(Color.btTextSecondary)
            Button("Añadir posición") { showAddSheet = true }
                .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var content: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                summaryCards
                HStack(alignment: .top, spacing: 16) {
                    distributionChart.frame(width: 280)
                    positionsTable.frame(maxWidth: .infinity)
                }
            }
            .padding(20)
        }
        .refreshable { await viewModel.refreshQuotes(for: positions) }
    }

    private var summaryCards: some View {
        let m = viewModel.metrics(for: positions)
        return LazyVGrid(columns: [GridItem(.adaptive(minimum: 180), spacing: 12)], spacing: 12) {
            MetricTile(label: "Valor total", value: m.totalValue, isCurrency: true)
            MetricTile(label: "Coste total", value: m.totalCost, isCurrency: true)
            MetricTile(label: "P&L total", value: m.totalPnL, isCurrency: true, colored: true)
            MetricTile(label: "P&L %", value: m.totalPnLPct, isPercent: true, colored: true)
        }
    }

    private var distributionData: [(symbol: String, value: Double)] {
        positions.compactMap { pos in
            let price = viewModel.quotes[pos.symbol]?.regularMarketPrice ?? pos.avgCost
            let value = pos.quantity * price
            return value > 0 ? (pos.symbol, value) : nil
        }
    }

    private var distributionChart: some View {
        let data = distributionData
        let palette: [Color] = [.btAccent, .btGreen, .btOrange, .btPurple, .btYellow, .btRed]

        return VStack(alignment: .leading, spacing: 10) {
            Text("Distribución")
                .font(.headline)
                .foregroundStyle(Color.btTextPrimary)
            Chart(Array(data.enumerated()), id: \.offset) { index, item in
                SectorMark(angle: .value("Valor", item.value), innerRadius: .ratio(0.6), angularInset: 1.5)
                    .foregroundStyle(palette[index % palette.count])
                    .cornerRadius(3)
            }
            .frame(height: 200)
            VStack(alignment: .leading, spacing: 4) {
                ForEach(Array(data.enumerated()), id: \.offset) { index, item in
                    HStack(spacing: 6) {
                        Circle().fill(palette[index % palette.count]).frame(width: 8, height: 8)
                        Text(item.symbol).font(.caption).foregroundStyle(Color.btTextSecondary)
                    }
                }
            }
        }
        .padding(14)
        .background(Color.btCard)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.btBorder, lineWidth: 1))
    }

    private var positionsTable: some View {
        VStack(spacing: 0) {
            ForEach(positions) { pos in
                PositionRow(position: pos, quote: viewModel.quotes[pos.symbol]) {
                    editingPosition = pos
                } onDelete: {
                    modelContext.delete(pos)
                    try? modelContext.save()
                }
                if pos.id != positions.last?.id {
                    Divider().overlay(Color.btBorder)
                }
            }
        }
        .background(Color.btCard)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.btBorder, lineWidth: 1))
    }

    private func addPosition(symbol: String, name: String, quantity: Double, avgCost: Double) {
        let entity = PortfolioPositionEntity(symbol: symbol, name: name, quantity: quantity, avgCost: avgCost)
        modelContext.insert(entity)
        try? modelContext.save()
        Task { await viewModel.refreshQuotes(for: positions) }
    }
}
