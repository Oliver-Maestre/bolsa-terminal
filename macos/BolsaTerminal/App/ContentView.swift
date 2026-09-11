import SwiftUI

enum AppSection: String, CaseIterable, Identifiable {
    case dashboard, screener, chart, comparison, portfolio, broker, bot, ai, simulator

    var id: String { rawValue }

    var title: String {
        switch self {
        case .dashboard: return "Dashboard"
        case .screener: return "Screener"
        case .chart: return "Gráfico"
        case .comparison: return "Comparativa"
        case .portfolio: return "Cartera"
        case .broker: return "Broker"
        case .bot: return "Bot"
        case .ai: return "IA"
        case .simulator: return "Simulador"
        }
    }

    var systemImage: String {
        switch self {
        case .dashboard: return "square.grid.2x2"
        case .screener: return "line.3.horizontal.decrease.circle"
        case .chart: return "chart.xyaxis.line"
        case .comparison: return "arrow.left.arrow.right"
        case .portfolio: return "briefcase"
        case .broker: return "dollarsign.circle"
        case .bot: return "cpu"
        case .ai: return "sparkles"
        case .simulator: return "function"
        }
    }
}

struct ContentView: View {
    @State private var selection: AppSection? = .dashboard

    var body: some View {
        NavigationSplitView {
            List(AppSection.allCases, selection: $selection) { section in
                Label(section.title, systemImage: section.systemImage)
                    .tag(section)
            }
            .navigationTitle("Bolsa Terminal")
        } detail: {
            NavigationStack {
                detailView
            }
        }
    }

    @ViewBuilder
    private var detailView: some View {
        switch selection {
        case .dashboard, .none:
            DashboardView()
        case .screener:
            ScreenerView()
        case .chart:
            ChartView()
        case .comparison:
            ComparisonView()
        case .portfolio:
            PortfolioView()
        case .broker:
            BrokerView()
        case .bot:
            BotView()
        case .ai:
            AiChatView()
        case .simulator:
            SimulatorView()
        case .some(let section):
            PlaceholderView(section: section)
        }
    }
}
