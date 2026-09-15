import AppKit

/// Opts out of macOS's persistent window-state restoration. This is a
/// live-data dashboard, not a document app — restoring a stale window from a
/// previous (often force-quit, during development) launch can show an empty
/// or frozen window instead of the fresh load a new launch should trigger.
final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
        false
    }

    /// Belt-and-suspenders: if a window still ends up off the visible screen
    /// (e.g. inherited coordinates from a monitor that's no longer connected
    /// at this position), force it back onto the main screen instead of
    /// leaving the app looking like it launched to nothing.
    func applicationDidFinishLaunching(_ notification: Notification) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            guard let window = NSApp.windows.first(where: { $0.isVisible }),
                  let screen = NSScreen.main else { return }
            let visibleFrame = screen.visibleFrame
            let windowOnScreen = NSScreen.screens.contains { $0.frame.intersects(window.frame) }
            if !windowOnScreen {
                window.setFrame(
                    NSRect(
                        x: visibleFrame.midX - window.frame.width / 2,
                        y: visibleFrame.midY - window.frame.height / 2,
                        width: window.frame.width,
                        height: window.frame.height
                    ),
                    display: true
                )
            }
            window.makeKeyAndOrderFront(nil)
        }
    }
}
