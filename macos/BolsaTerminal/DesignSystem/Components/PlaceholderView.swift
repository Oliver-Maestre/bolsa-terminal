import SwiftUI

/// Shown for sections not yet implemented (Chart, Comparison, Portfolio,
/// Broker, Bot, AI, Simulator — landing in later delivery phases).
struct PlaceholderView: View {
    let section: AppSection

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: section.systemImage)
                .font(.system(size: 40))
                .foregroundStyle(Color.btTextSecondary)
            Text(section.title)
                .font(.title2.bold())
                .foregroundStyle(Color.btTextPrimary)
            Text("Próximamente")
                .foregroundStyle(Color.btTextSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.btBackground)
        .navigationTitle(section.title)
    }
}
