import Foundation
import Observation

@MainActor
@Observable
final class BrokerViewModel {
    enum State {
        case idle, loading, loaded, error(String)
    }

    private struct OrderPayload: Encodable {
        let symbol: String
        let side: String
        let quantity: Double
        let price: Double?
        let stopLoss: Double?
        let takeProfit: Double?
    }

    var state: State = .idle
    var account: BrokerAccount?

    // Order form
    var orderSymbol: String = ""
    var orderSide: OrderSide = .buy
    var orderQuantity: String = ""
    var orderPrice: String = ""
    var orderStopLoss: String = ""
    var orderTakeProfit: String = ""
    var isSubmitting = false
    var submitError: String?
    private var consecutiveRefreshFailures = 0

    func load() async {
        state = .loading
        do {
            account = try await APIClient.shared.request(Endpoints.brokerAccount)
            state = .loaded
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }

    /// Periodic background refresh — no loading flash, silently ignores
    /// transient failures, and never touches the in-progress order form
    /// fields so a refresh can't wipe what the user is typing. After 3
    /// consecutive failures falls back to a full `load()` so a sustained
    /// outage surfaces as an actionable error instead of staying stuck.
    func refresh() async {
        do {
            account = try await APIClient.shared.request(Endpoints.brokerAccount)
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

    func submitOrder() async {
        guard let quantity = Double(orderQuantity), quantity > 0, !orderSymbol.isEmpty else {
            submitError = "Revisa símbolo y cantidad."
            return
        }
        isSubmitting = true
        submitError = nil
        defer { isSubmitting = false }

        let payload = OrderPayload(
            symbol: orderSymbol.uppercased(),
            side: orderSide.rawValue,
            quantity: quantity,
            price: Double(orderPrice),
            stopLoss: Double(orderStopLoss),
            takeProfit: Double(orderTakeProfit)
        )
        do {
            let body = try JSONEncoder().encode(payload)
            try await APIClient.shared.rawData(Endpoints.brokerOrder(body))
            orderQuantity = ""
            orderPrice = ""
            orderStopLoss = ""
            orderTakeProfit = ""
            await load()
        } catch {
            submitError = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
        }
    }

    func sellAll(_ symbol: String) async {
        do {
            try await APIClient.shared.rawData(Endpoints.brokerSellAll(symbol))
            await load()
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }

    func reset() async {
        do {
            try await APIClient.shared.rawData(Endpoints.brokerReset)
            await load()
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }
}
