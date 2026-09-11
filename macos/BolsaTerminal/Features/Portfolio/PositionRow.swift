import SwiftUI

struct PositionRow: View {
    let position: PortfolioPositionEntity
    let quote: QuoteSummary?
    let onEdit: () -> Void
    let onDelete: () -> Void

    private var currentPrice: Double { quote?.regularMarketPrice ?? position.avgCost }
    private var value: Double { position.quantity * currentPrice }
    private var cost: Double { position.quantity * position.avgCost }
    private var pnl: Double { value - cost }
    private var pnlPct: Double { cost > 0 ? (pnl / cost) * 100 : 0 }

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(position.symbol)
                    .font(.system(.body, design: .monospaced)).bold()
                    .foregroundStyle(Color.btTextPrimary)
                Text(position.name)
                    .font(.caption)
                    .foregroundStyle(Color.btTextSecondary)
                    .lineLimit(1)
            }
            Spacer()
            Text(position.quantity, format: .number.precision(.fractionLength(0...4)))
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(Color.btTextSecondary)
                .frame(width: 60, alignment: .trailing)
            Text(value, format: .currency(code: "USD"))
                .font(.system(.body, design: .monospaced))
                .foregroundStyle(Color.btTextPrimary)
                .frame(width: 100, alignment: .trailing)
            Text(String(format: "%+.2f%%", pnlPct))
                .font(.system(.body, design: .monospaced))
                .foregroundStyle(pnl >= 0 ? Color.btGreen : Color.btRed)
                .frame(width: 80, alignment: .trailing)
            Menu {
                Button("Editar", action: onEdit)
                Button("Eliminar", role: .destructive, action: onDelete)
            } label: {
                Image(systemName: "ellipsis.circle")
            }
            .menuStyle(.borderlessButton)
            .frame(width: 24)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }
}
