import Foundation

struct SearchResult: Codable, Hashable, Identifiable {
    var id: String { symbol }
    let symbol: String
    let shortname: String
    let longname: String?
    let exchange: String
    let quoteType: String
}

struct ScreenerItem: Codable, Hashable, Identifiable {
    var id: String { symbol }
    let symbol: String
    let shortName: String
    let exchange: String
    let sector: String?
    let quoteType: String
    let price: Double
    let change: Double
    let changePercent: Double
    let volume: Double
    let marketCap: Double?
    let rsi: Double
    let macdHistogram: Double
    let bbPercent: Double
    let signal: SignalType
    let score: Double
    let sparkline: [Double]
}

struct MarketIndex: Codable, Hashable, Identifiable {
    var id: String { symbol }
    let symbol: String
    let name: String
    let price: Double
    let change: Double
    let changePercent: Double
    let sparkline: [Double]
    let marketId: String
}
