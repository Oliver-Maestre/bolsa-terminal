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

    func load(symbol: String? = nil) async {
        if let symbol, !symbol.isEmpty {
            self.symbol = symbol.uppercased()
        }
        guard !self.symbol.isEmpty else { return }

        state = .loading
        do {
            history = try await APIClient.shared.request(
                Endpoints.history(self.symbol, period: period, interval: "1d")
            )
            state = .loaded
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
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
