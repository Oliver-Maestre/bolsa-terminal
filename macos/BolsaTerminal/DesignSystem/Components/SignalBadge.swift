import SwiftUI

struct SignalBadge: View {
    let signal: SignalType

    var body: some View {
        Text(signal.label.uppercased())
            .font(.system(size: 10, weight: .bold))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(backgroundColor)
            .foregroundStyle(foregroundColor)
            .clipShape(Capsule())
    }

    private var backgroundColor: Color {
        switch signal {
        case .strongBuy: return Color.btGreen.opacity(0.25)
        case .buy: return Color.btGreen.opacity(0.15)
        case .neutral: return Color.btTertiary
        case .sell: return Color.btOrange.opacity(0.2)
        case .strongSell: return Color.btRed.opacity(0.25)
        }
    }

    private var foregroundColor: Color {
        switch signal {
        case .strongBuy, .buy: return Color.btGreen
        case .neutral: return Color.btTextSecondary
        case .sell: return Color.btOrange
        case .strongSell: return Color.btRed
        }
    }
}
