import Foundation
import Observation

@MainActor
@Observable
final class BacktestViewModel {
    enum State {
        case idle, loading, loaded(BacktestResult), error(String)
    }

    var symbol: String = "AAPL"
    var buyDate: Date = Calendar.current.date(byAdding: .year, value: -1, to: Date()) ?? Date()
    var sellDate: Date = Date()
    var useToday: Bool = true
    var quantity: String = "10"
    var state: State = .idle

    private static let dateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    func run() async {
        state = .loading
        var params: [String: String] = [
            "symbol": symbol.uppercased(),
            "buyDate": Self.dateFormatter.string(from: buyDate),
        ]
        if !useToday {
            params["sellDate"] = Self.dateFormatter.string(from: sellDate)
        }
        if let qty = Double(quantity) {
            params["quantity"] = String(qty)
        }
        do {
            let result: BacktestResult = try await APIClient.shared.request(Endpoints.backtest(params: params))
            state = .loaded(result)
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }
}
