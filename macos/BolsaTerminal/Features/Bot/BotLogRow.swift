import SwiftUI

struct BotLogRow: View {
    let entry: BotLogEntry

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Text(actionLabel)
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(actionColor)
                .frame(width: 50, alignment: .leading)
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    if let symbol = entry.symbol {
                        Text(symbol).font(.system(.caption, design: .monospaced)).bold()
                    }
                    Text(entry.reason)
                        .font(.caption)
                        .foregroundStyle(Color.btTextSecondary)
                        .lineLimit(2)
                }
                Text(Date(timeIntervalSince1970: entry.timestamp / 1000), style: .time)
                    .font(.caption2)
                    .foregroundStyle(Color.btTextMuted)
            }
            Spacer()
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
    }

    private var actionLabel: String {
        switch entry.action {
        case .buy: return "COMPRA"
        case .sell: return "VENTA"
        case .hold: return "HOLD"
        case .scan: return "SCAN"
        case .info: return "INFO"
        case .error: return "ERROR"
        }
    }

    private var actionColor: Color {
        switch entry.action {
        case .buy: return .btGreen
        case .sell: return .btRed
        case .hold: return .btTextSecondary
        case .scan: return .btAccent
        case .info: return .btTextSecondary
        case .error: return .btRed
        }
    }
}
