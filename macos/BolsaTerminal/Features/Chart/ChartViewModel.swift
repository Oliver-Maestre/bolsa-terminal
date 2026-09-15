import Foundation
import Observation

@MainActor
@Observable
final class ChartViewModel {
    enum State {
        case idle, loading, loaded, error(String)
    }

    static let periods = ["3mo", "6mo", "1y", "5y", "10y"]

    var symbol: String = "AAPL"
    var period: String = "1y"
    var state: State = .idle
    var history: HistoryResponse?

    var searchQuery: String = ""
    var searchResults: [SearchResult] = []
    private var searchTask: Task<Void, Never>?
    private var consecutiveRefreshFailures = 0

    func load(symbol: String? = nil) async {
        if let symbol, !symbol.isEmpty {
            self.symbol = symbol.uppercased()
        }
        guard !self.symbol.isEmpty else { return }

        state = .loading
        do {
            try await fetch()
            state = .loaded
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }

    /// Periodic background refresh for the currently selected symbol/period —
    /// no loading flash, silently ignores transient failures. After 3
    /// consecutive failures falls back to a full `load()` so a sustained
    /// outage surfaces as an actionable error instead of staying stuck.
    func refresh() async {
        guard !symbol.isEmpty else { return }
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
        let result: HistoryResponse = try await APIClient.shared.request(
            Endpoints.history(symbol, period: period, interval: "1d")
        )
        // A backend hiccup can return a valid-but-empty bars array rather
        // than actually failing — don't let that silently wipe the chart.
        guard !result.bars.isEmpty || (history?.bars.isEmpty ?? true) else {
            throw APIError.server(status: 200, message: "Empty response")
        }
        history = result
    }

    func search(_ query: String) {
        searchQuery = query
        searchTask?.cancel()
        guard query.count >= 1 else {
            searchResults = []
            return
        }
        searchTask = Task {
            try? await Task.sleep(nanoseconds: 300_000_000)
            guard !Task.isCancelled else { return }
            do {
                let results: [SearchResult] = try await APIClient.shared.request(Endpoints.search(query))
                if !Task.isCancelled { searchResults = results }
            } catch {
                // Best-effort search — ignore failures silently.
            }
        }
    }
}
