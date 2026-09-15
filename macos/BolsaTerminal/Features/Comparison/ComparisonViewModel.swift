import Foundation
import Observation

@MainActor
@Observable
final class ComparisonViewModel {
    enum State {
        case idle, loading, loaded, error(String)
    }

    var symbolsInput: String = "AAPL, MSFT"
    var period: String = "1y"
    var state: State = .idle
    var series: [String: [OHLCVBar]] = [:]
    private var consecutiveRefreshFailures = 0

    func load() async {
        guard !parsedSymbols.isEmpty else { return }
        state = .loading
        do {
            series = try await fetchSeries()
            state = .loaded
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }

    /// Periodic background refresh for the currently selected symbols/period —
    /// no loading flash, silently ignores transient failures. After 3
    /// consecutive failures falls back to a full `load()` so a sustained
    /// outage surfaces as an actionable error instead of staying stuck.
    func refresh() async {
        guard !parsedSymbols.isEmpty else { return }
        do {
            series = try await fetchSeries()
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

    private var parsedSymbols: [String] {
        symbolsInput
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces).uppercased() }
            .filter { !$0.isEmpty }
    }

    private func fetchSeries() async throws -> [String: [OHLCVBar]] {
        let symbols = parsedSymbols
        let period = self.period
        var result: [String: [OHLCVBar]] = [:]
        try await withThrowingTaskGroup(of: (String, HistoryResponse).self) { group in
            for symbol in symbols {
                group.addTask {
                    let history: HistoryResponse = try await APIClient.shared.request(
                        Endpoints.history(symbol, period: period, interval: "1d")
                    )
                    return (symbol, history)
                }
            }
            for try await (symbol, history) in group {
                result[symbol] = history.bars
            }
        }
        return result
    }
}
