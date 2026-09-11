import SwiftUI

struct MetricTile: View {
    let label: String
    let value: Double
    var isCurrency: Bool = false
    var isPercent: Bool = false
    var colored: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.caption)
                .foregroundStyle(Color.btTextSecondary)
            Text(formatted)
                .font(.system(.title3, design: .monospaced)).bold()
                .foregroundStyle(colored ? (value >= 0 ? Color.btGreen : Color.btRed) : Color.btTextPrimary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.btCard)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.btBorder, lineWidth: 1))
    }

    private var formatted: String {
        if isPercent {
            return String(format: "%@%.2f%%", value >= 0 ? "+" : "", value)
        }
        if isCurrency {
            return value.formatted(.currency(code: "USD"))
        }
        return String(format: "%.2f", value)
    }
}
