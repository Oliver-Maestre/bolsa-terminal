import SwiftUI

struct RecommendationCard: View {
    let recommendation: Recommendation

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                SignalBadge(signal: recommendation.signal)
                Spacer()
                Text("Score \(String(format: "%.1f", recommendation.score))")
                    .font(.system(.subheadline, design: .monospaced))
                    .foregroundStyle(Color.btTextSecondary)
            }

            Divider().overlay(Color.btBorder)

            VStack(spacing: 8) {
                ForEach(recommendation.components, id: \.name) { component in
                    HStack {
                        Text(component.name)
                            .font(.caption)
                            .foregroundStyle(Color.btTextSecondary)
                        Spacer()
                        Text(component.signal)
                            .font(.caption.bold())
                            .foregroundStyle(Color.btTextPrimary)
                        Text(component.value.map { String(format: "%.1f", $0) } ?? "—")
                            .font(.system(.caption, design: .monospaced))
                            .foregroundStyle(Color.btTextSecondary)
                            .frame(width: 50, alignment: .trailing)
                    }
                }
            }
        }
        .padding(14)
        .background(Color.btCard)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.btBorder, lineWidth: 1))
    }
}
