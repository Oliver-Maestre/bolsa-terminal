import SwiftUI

@main
struct BolsaTerminalApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
                .frame(minWidth: 1000, minHeight: 650)
                .preferredColorScheme(.dark)
        }
        .defaultSize(width: 1280, height: 800)
        .defaultPosition(.center)
        .modelContainer(for: PortfolioPositionEntity.self)

        Settings {
            SettingsView()
        }
    }
}
