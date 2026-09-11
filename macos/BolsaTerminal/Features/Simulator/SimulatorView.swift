import SwiftUI

struct SimulatorView: View {
    private enum Tab: String, CaseIterable {
        case backtest = "Backtesting"
        case projection = "Proyecciones"
        case tax = "Calculadora Fiscal"
    }

    @State private var tab: Tab = .backtest

    var body: some View {
        VStack(spacing: 0) {
            Picker("", selection: $tab) {
                ForEach(Tab.allCases, id: \.self) { Text($0.rawValue).tag($0) }
            }
            .pickerStyle(.segmented)
            .labelsHidden()
            .padding(16)

            Divider().overlay(Color.btBorder)

            switch tab {
            case .backtest: BacktestView()
            case .projection: ProjectionView()
            case .tax: TaxCalculatorView()
            }
        }
        .background(Color.btBackground)
        .navigationTitle("Simulador")
    }
}
