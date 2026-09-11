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

    func load() async {
        state = .loading
        do {
            async let indicesTask: [MarketIndex] = APIClient.shared.request(Endpoints.marketOverview)
            async let screenerTask: [ScreenerItem] = APIClient.shared.request(Endpoints.screener())
            let (idx, screener) = try await (indicesTask, screenerTask)
            indices = idx
            topMovers = Array(
                screener.sorted { abs($0.changePercent) > abs($1.changePercent) }.prefix(10)
            )
            state = .loaded
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }
}
