import Foundation

struct QuoteSummary: Codable, Hashable, Identifiable {
    var id: String { symbol }
    let symbol: String
    let shortName: String
    let longName: String?
    let exchange: String
    let currency: String
    let regularMarketPrice: Double
    let regularMarketChange: Double
    let regularMarketChangePercent: Double
    let regularMarketVolume: Double
    let regularMarketOpen: Double?
    let regularMarketDayHigh: Double?
    let regularMarketDayLow: Double?
    let regularMarketPreviousClose: Double?
    let fiftyTwoWeekHigh: Double?
    let fiftyTwoWeekLow: Double?
    let marketCap: Double?
    let trailingPE: Double?
    let forwardPE: Double?
    let dividendYield: Double?
    let beta: Double?
    let averageVolume: Double?
    let sector: String?
    let industry: String?
    let quoteType: String
    let marketState: String
}
