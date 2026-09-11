import SwiftUI

struct OpenPositionsList: View {
    let positions: [BrokerPosition]
    let onSellAll: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Posiciones abiertas")
                .font(.headline)
                .foregroundStyle(Color.btTextPrimary)

            if positions.isEmpty {
                Text("Sin posiciones abiertas")
                    .font(.caption)
                    .foregroundStyle(Color.btTextSecondary)
                    .padding(.vertical, 8)
            } else {
                VStack(spacing: 0) {
                    ForEach(positions) { pos in
                        row(pos)
                        if pos.id != positions.last?.id {
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

    private func row(_ pos: BrokerPosition) -> some View {
        HStack(spacing: 10) {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(pos.symbol).font(.system(.body, design: .monospaced)).bold()
                    if pos.source == .bot {
                        Image(systemName: "cpu").font(.caption2).foregroundStyle(Color.btAccent)
                    }
                }
                Text("\(pos.quantity, format: .number.precision(.fractionLength(0...4))) @ \(pos.avgCost, format: .number.precision(.fractionLength(2)))")
                    .font(.caption2)
                    .foregroundStyle(Color.btTextSecondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text(pos.value, format: .currency(code: "USD"))
                    .font(.system(.caption, design: .monospaced))
                Text(String(format: "%+.2f%%", pos.pnlPct))
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(pos.pnl >= 0 ? Color.btGreen : Color.btRed)
            }
            Button("Vender") { onSellAll(pos.symbol) }
                .buttonStyle(.bordered)
                .controlSize(.small)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
    }
}
