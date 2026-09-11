import SwiftUI

struct ScreenerRow: View {
    let item: ScreenerItem

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(item.symbol)
                    .font(.system(.body, design: .monospaced)).bold()
                    .foregroundStyle(Color.btTextPrimary)
                Text(item.shortName)
                    .font(.caption)
                    .foregroundStyle(Color.btTextSecondary)
                    .lineLimit(1)
            }
            Spacer()
            Text(item.price, format: .number.precision(.fractionLength(2)))
                .font(.system(.body, design: .monospaced))
                .foregroundStyle(Color.btTextPrimary)
            Text(item.changePercent / 100, format: .percent.precision(.fractionLength(2)))
                .font(.system(.body, design: .monospaced))
                .foregroundStyle(item.changePercent >= 0 ? Color.btGreen : Color.btRed)
                .frame(width: 90, alignment: .trailing)
            SignalBadge(signal: item.signal)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }
}
