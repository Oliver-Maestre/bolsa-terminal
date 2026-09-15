import Foundation
import Observation

@MainActor
@Observable
final class DashboardViewModel {
    enum State {
        case idle, loading, loaded, error(String)
    }

    var state: State = .idle
    var indices: [MarketIndex] = []
    var topMovers: [ScreenerItem] = []
    private var consecutiveRefreshFailures = 0

    func load() async {
        state = .loading
        do {
            try await fetch()
            state = .loaded
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }

    /// Periodic background refresh — updates data without flipping to the
    /// loading state (which would blank an already-loaded screen), and
    /// silently ignores transient failures so the last good data stays on
    /// screen until the next tick succeeds. After 3 consecutive failures
    /// (sustained outage, not a blip) it falls back to a full `load()` so a
    /// real, lasting problem surfaces as an actionable error instead of the
    /// screen silently sitting on stale data forever.
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
        async let indicesTask: [MarketIndex] = APIClient.shared.request(Endpoints.marketOverview)
        async let screenerTask: [ScreenerItem] = APIClient.shared.request(Endpoints.screener())
        let (idx, screener) = try await (indicesTask, screenerTask)

        // A backend hiccup can return a valid-but-empty array (HTTP 200, no
        // thrown error) rather than actually failing — treat that as a
        // failure too, so it doesn't silently wipe out good data already on
        // screen with nothing to show for it.
        guard (!idx.isEmpty || indices.isEmpty), (!screener.isEmpty || topMovers.isEmpty) else {
            throw APIError.server(status: 200, message: "Empty response")
        }

        indices = idx
        topMovers = Array(
            screener.sorted { abs($0.changePercent) > abs($1.changePercent) }.prefix(10)
        )
    }
}
