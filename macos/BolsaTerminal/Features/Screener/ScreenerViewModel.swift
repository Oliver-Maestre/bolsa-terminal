import Foundation
import Observation

@MainActor
@Observable
final class ScreenerViewModel {
    enum State {
        case idle, loading, loaded, error(String)
    }

    var state: State = .idle
    var items: [ScreenerItem] = []
    var searchText: String = ""
    private var consecutiveRefreshFailures = 0

    var filteredItems: [ScreenerItem] {
        guard !searchText.isEmpty else { return items }
        return items.filter {
            $0.symbol.localizedCaseInsensitiveContains(searchText) ||
            $0.shortName.localizedCaseInsensitiveContains(searchText)
        }
    }

    func load() async {
        state = .loading
        do {
            try await fetch()
            state = .loaded
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }

    /// Periodic background refresh — no loading flash, silently ignores
    /// transient failures so the last good data stays on screen. After 3
    /// consecutive failures falls back to a full `load()` so a sustained
    /// outage surfaces as an actionable error instead of staying stuck.
    func refresh() async {
        do {
            try await fetch()
            state = .loaded
            consecutiveRefreshFailures = 0
        } catch {
            consecutiveRefreshFailures += 1
            if consecutiveRefreshFailures >= 3 {
                consecutiveRefreshFailures = 0
                await load()
            }
        }
    }

    private func fetch() async throws {
        let result: [ScreenerItem] = try await APIClient.shared.request(Endpoints.screener())
        // A backend hiccup can return a valid-but-empty array rather than
        // actually failing — don't let that silently wipe good data on screen.
        guard !result.isEmpty || items.isEmpty else {
            throw APIError.server(status: 200, message: "Empty response")
        }
        items = result
    }
}
