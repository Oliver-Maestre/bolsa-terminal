import Foundation

enum BacktestRating: String, Codable {
    case excellent
    case good
    case neutral
    case poor
    case bad
}

struct BacktestChartPoint: Codable, Hashable {
    let date: String
    let symbol: Double
    let spx: Double?
    let ibex: Double?
}

struct BacktestResult: Codable, Hashable {
    let symbol: String
    let buyDate: String
    let sellDate: String
    let buyPrice: Double
    let sellPrice: Double
    let quantity: Double
    let pnl: Double
    let returnPct: Double
    let annualizedReturn: Double
    let holdDays: Double
    let rating: BacktestRating
    let alphaSPX: Double?
    let benchmarkReturnSPX: Double?
    let benchmarkReturnIBEX: Double?
    let chart: [BacktestChartPoint]
}

struct ProjectionHorizon: Codable, Hashable, Identifiable {
    var id: String { key }
    let key: String
    let label: String
    let days: Double
    let p5: Double
    let p25: Double
    let p50: Double
    let p75: Double
    let p95: Double
    let retP50: Double
    let retP25: Double
    let retP75: Double
    let probProfit: Double
}

struct ProjectionResult: Codable, Hashable {
    let symbol: String
    let currentPrice: Double
    let investment: Double
    let shares: Double
    let annualReturn: Double
    let annualVol: Double
    let dataPoints: Int
    let projections: [ProjectionHorizon]
}
