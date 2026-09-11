import SwiftUI

struct MarketIndexCard: View {
    let index: MarketIndex

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(index.name)
                .font(.caption)
                .foregroundStyle(Color.btTextSecondary)
                .lineLimit(1)
            Text(index.price, format: .number.precision(.fractionLength(2)))
                .font(.system(.title3, design: .monospaced)).bold()
                .foregroundStyle(Color.btTextPrimary)
            Text(index.changePercent / 100, format: .percent.precision(.fractionLength(2)))
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(index.changePercent >= 0 ? Color.btGreen : Color.btRed)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.btCard)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.btBorder, lineWidth: 1))
    }
}
