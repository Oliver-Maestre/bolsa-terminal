import Foundation

enum InvestmentTimeframe: String, Codable, CaseIterable {
    case short
    case medium
    case long
}

struct InvestmentRecommendation: Codable, Hashable, Identifiable {
    var id: String { symbol + timeframe.rawValue }
    let symbol: String
    let shortName: String
    let exchange: String
    let price: Double
    let signal: String
    let score: Double
    let rsi: Double
    let macdHistogram: Double
    let bbPercent: Double
    let changePercent: Double
    let timeframe: InvestmentTimeframe
    let confidence: Double
    let entryZone: [Double]
    let stopLoss: Double
    let takeProfit: Double
    let riskReward: Double
    let reasons: [String]
    let risks: [String]
    let horizon: String
    let strategy: String
}

struct AiRecommendations: Codable, Hashable {
    let short: [InvestmentRecommendation]
    let medium: [InvestmentRecommendation]
    let long: [InvestmentRecommendation]
}

struct ChatMessage: Codable, Hashable, Identifiable {
    let id: String
    let role: String
    let content: String
    let timestamp: Double
}
