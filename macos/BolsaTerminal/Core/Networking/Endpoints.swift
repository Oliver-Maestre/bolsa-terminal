import Foundation

struct Endpoint {
    let path: String
    let method: String
    var queryItems: [URLQueryItem]? = nil
    var body: Data? = nil
}

/// Mirrors frontend/src/api/client.ts 1:1 so the native clients never drift
/// from the actual backend routes.
enum Endpoints {
    static func quote(_ symbol: String) -> Endpoint {
        Endpoint(path: "/api/quotes/\(symbol)", method: "GET")
    }

    static func batchQuotes(_ symbols: [String]) -> Endpoint {
        Endpoint(path: "/api/quotes", method: "GET",
                 queryItems: [URLQueryItem(name: "symbols", value: symbols.joined(separator: ","))])
    }

    static func history(_ symbol: String, period: String = "10y", interval: String = "1d") -> Endpoint {
        Endpoint(path: "/api/history/\(symbol)", method: "GET", queryItems: [
            URLQueryItem(name: "period", value: period),
            URLQueryItem(name: "interval", value: interval),
        ])
    }

    static func search(_ query: String) -> Endpoint {
        Endpoint(path: "/api/search", method: "GET", queryItems: [URLQueryItem(name: "q", value: query)])
    }

    static func screener(params: [String: String] = [:]) -> Endpoint {
        Endpoint(path: "/api/screener", method: "GET",
                 queryItems: params.map { URLQueryItem(name: $0.key, value: $0.value) })
    }

    static var marketOverview: Endpoint {
        Endpoint(path: "/api/markets/overview", method: "GET")
    }

    static var health: Endpoint {
        Endpoint(path: "/api/health", method: "GET")
    }

    // ─── Broker ───────────────────────────────────────────────────────────
    static var brokerAccount: Endpoint {
        Endpoint(path: "/api/broker/account", method: "GET")
    }

    static func brokerOrder(_ body: Data) -> Endpoint {
        Endpoint(path: "/api/broker/order", method: "POST", body: body)
    }

    static func brokerSellAll(_ symbol: String) -> Endpoint {
        Endpoint(path: "/api/broker/sell-all/\(symbol)", method: "POST")
    }

    static var brokerReset: Endpoint {
        Endpoint(path: "/api/broker/reset", method: "POST")
    }

    // ─── Bot ──────────────────────────────────────────────────────────────
    static var botStatus: Endpoint {
        Endpoint(path: "/api/bot/status", method: "GET")
    }

    static func botLog(limit: Int = 100) -> Endpoint {
        Endpoint(path: "/api/bot/log", method: "GET",
                 queryItems: [URLQueryItem(name: "limit", value: String(limit))])
    }

    static func botConfigure(_ body: Data) -> Endpoint {
        Endpoint(path: "/api/bot/configure", method: "POST", body: body)
    }

    static var botScan: Endpoint {
        Endpoint(path: "/api/bot/scan", method: "POST")
    }

    static var botStream: Endpoint {
        Endpoint(path: "/api/bot/stream", method: "GET")
    }

    // ─── AI ───────────────────────────────────────────────────────────────
    static var aiStatus: Endpoint {
        Endpoint(path: "/api/ai/status", method: "GET")
    }

    static var aiRecommendations: Endpoint {
        Endpoint(path: "/api/ai/recommendations", method: "GET")
    }

    static func aiChat(_ body: Data) -> Endpoint {
        Endpoint(path: "/api/ai/chat", method: "POST", body: body)
    }

    // ─── Simulator ────────────────────────────────────────────────────────
    static func backtest(params: [String: String]) -> Endpoint {
        Endpoint(path: "/api/simulator/backtest", method: "GET",
                 queryItems: params.map { URLQueryItem(name: $0.key, value: $0.value) })
    }

    static func projection(params: [String: String]) -> Endpoint {
        Endpoint(path: "/api/simulator/projection", method: "GET",
                 queryItems: params.map { URLQueryItem(name: $0.key, value: $0.value) })
    }
}
