import SwiftUI

@main
struct BolsaTerminalApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .frame(minWidth: 1000, minHeight: 650)
                .preferredColorScheme(.dark)
        }
        .defaultSize(width: 1280, height: 800)
        .modelContainer(for: PortfolioPositionEntity.self)

        Settings {
            SettingsView()
        }
    }
}
