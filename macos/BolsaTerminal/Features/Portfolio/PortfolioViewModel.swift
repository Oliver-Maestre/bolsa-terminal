import Foundation
import Observation

@MainActor
@Observable
final class PortfolioViewModel {
    enum State {
        case idle, loading, loaded, error(String)
    }

    struct Metrics {
        var totalValue: Double = 0
        var totalCost: Double = 0
        var totalPnL: Double = 0
        var totalPnLPct: Double = 0
        var dayPnL: Double = 0
    }

    var state: State = .idle
    var quotes: [String: QuoteSummary] = [:]
    private var consecutiveRefreshFailures = 0

    /// Mirrors frontend/src/components/portfolio/PortfolioSummary.tsx::computeMetrics
    func metrics(for positions: [PortfolioPositionEntity]) -> Metrics {
        var m = Metrics()
        for pos in positions {
            guard let q = quotes[pos.symbol] else { continue }
            m.totalValue += pos.quantity * q.regularMarketPrice
            m.totalCost += pos.quantity * pos.avgCost
            m.dayPnL += pos.quantity * q.regularMarketChange
        }
        m.totalPnL = m.totalValue - m.totalCost
        m.totalPnLPct = m.totalCost > 0 ? (m.totalPnL / m.totalCost) * 100 : 0
        return m
    }

    func refreshQuotes(for positions: [PortfolioPositionEntity]) async {
        let symbols = Array(Set(positions.map { $0.symbol }))
        guard !symbols.isEmpty else {
            quotes = [:]
            state = .loaded
            return
        }
        state = .loading
        do {
            quotes = try await fetchQuotes(symbols: symbols)
            state = .loaded
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }

    /// Periodic background refresh — no loading flash, silently ignores
    /// transient failures so the last good data stays on screen. After 3
    /// consecutive failures falls back to a full `refreshQuotes()` so a
    /// sustained outage surfaces as an actionable error instead of staying stuck.
    func refresh(for positions: [PortfolioPositionEntity]) async {
        let symbols = Array(Set(positions.map { $0.symbol }))
        guard !symbols.isEmpty else { return }
        do {
            quotes = try await fetchQuotes(symbols: symbols)
            state = .loaded
            consecutiveRefreshFailures = 0
        } catch {
            consecutiveRefreshFailures += 1
            if consecutiveRefreshFailures >= 3 {
                consecutiveRefreshFailures = 0
                await refreshQuotes(for: positions)
            }
        }
    }

    private func fetchQuotes(symbols: [String]) async throws -> [String: QuoteSummary] {
        let result: [QuoteSummary] = try await APIClient.shared.request(Endpoints.batchQuotes(symbols))
        return Dictionary(uniqueKeysWithValues: result.map { ($0.symbol, $0) })
    }
}
