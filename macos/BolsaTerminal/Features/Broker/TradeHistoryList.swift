import SwiftUI

struct TradeHistoryList: View {
    let orders: [BrokerOrder]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Historial")
                .font(.headline)
                .foregroundStyle(Color.btTextPrimary)

            if orders.isEmpty {
                Text("Sin operaciones todavía")
                    .font(.caption)
                    .foregroundStyle(Color.btTextSecondary)
                    .padding(.vertical, 8)
            } else {
                VStack(spacing: 0) {
                    ForEach(orders.prefix(50)) { order in
                        row(order)
                        if order.id != orders.prefix(50).last?.id {
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

    private func row(_ order: BrokerOrder) -> some View {
        HStack(spacing: 10) {
            Text(order.side == .buy ? "COMPRA" : "VENTA")
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(order.side == .buy ? Color.btGreen : Color.btRed)
                .frame(width: 60, alignment: .leading)
            Text(order.symbol)
                .font(.system(.caption, design: .monospaced)).bold()
            Spacer()
            Text("\(order.quantity, format: .number.precision(.fractionLength(0...4))) @ \(order.price, format: .number.precision(.fractionLength(2)))")
                .font(.system(.caption2, design: .monospaced))
                .foregroundStyle(Color.btTextSecondary)
            if order.source == .bot {
                Image(systemName: "cpu").font(.caption2).foregroundStyle(Color.btAccent)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
    }
}
