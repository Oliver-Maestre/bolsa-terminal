import SwiftUI

struct AccountSummary: View {
    let account: BrokerAccount
    let onReset: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Cuenta simulada")
                    .font(.headline)
                    .foregroundStyle(Color.btTextPrimary)
                Spacer()
                Button("Reiniciar", role: .destructive, action: onReset)
                    .buttonStyle(.borderless)
                    .font(.caption)
            }
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                MetricTile(label: "Efectivo", value: account.cash, isCurrency: true)
                MetricTile(label: "Equity total", value: account.totalEquity, isCurrency: true)
                MetricTile(label: "P&L total", value: account.totalPnL, isCurrency: true, colored: true)
                MetricTile(label: "P&L %", value: account.totalPnLPct, isPercent: true, colored: true)
            }
            HStack {
                Text("\(account.tradeCount) operaciones · \(String(format: "%.0f", account.winRate))% acierto")
                    .font(.caption)
                    .foregroundStyle(Color.btTextSecondary)
                Spacer()
                Text("Comisiones: \(account.totalFeesPaid.formatted(.currency(code: "USD")))")
                    .font(.caption)
                    .foregroundStyle(Color.btTextSecondary)
            }
        }
    }
}
