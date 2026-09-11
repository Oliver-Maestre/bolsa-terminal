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

    func load() async {
        let symbols = symbolsInput
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces).uppercased() }
            .filter { !$0.isEmpty }
        guard !symbols.isEmpty else { return }

        state = .loading
        let period = self.period

        do {
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
            series = result
            state = .loaded
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }
}
