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
            items = try await APIClient.shared.request(Endpoints.screener())
            state = .loaded
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }
}
