import Foundation
import Observation

@MainActor
@Observable
final class ProjectionViewModel {
    enum State {
        case idle, loading, loaded(ProjectionResult), error(String)
    }

    var symbol: String = "AAPL"
    var amount: String = "1000"
    var state: State = .idle

    func run() async {
        guard let amountValue = Double(amount), amountValue > 0 else {
            state = .error("Introduce un importe válido.")
            return
        }
        state = .loading
        let params = ["symbol": symbol.uppercased(), "amount": String(amountValue)]
        do {
            let result: ProjectionResult = try await APIClient.shared.request(Endpoints.projection(params: params))
            state = .loaded(result)
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }
}
