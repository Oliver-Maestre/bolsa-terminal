import Foundation

struct OHLCVBar: Codable, Hashable {
    let time: Double
    let open: Double
    let high: Double
    let low: Double
    let close: Double
    let volume: Double
}

// Warmup periods (e.g. EMA200 needs 200 bars) produce NaN on the backend,
// which `JSON.stringify` serializes as `null` — these must stay optional
// or decoding throws the moment a shorter period is requested.
struct IndicatorSet: Codable, Hashable {
    let rsi: [Double?]
    let macdLine: [Double?]
    let macdSignal: [Double?]
    let macdHistogram: [Double?]
    let sma20: [Double?]
    let sma50: [Double?]
    let ema20: [Double?]
    let ema200: [Double?]
    let bbUpper: [Double?]
    let bbMiddle: [Double?]
    let bbLower: [Double?]
    let bbPercent: [Double?]
    let volumeMA20: [Double?]
}

enum SignalType: String, Codable, CaseIterable {
    case strongBuy = "STRONG_BUY"
    case buy = "BUY"
    case neutral = "NEUTRAL"
    case sell = "SELL"
    case strongSell = "STRONG_SELL"

    var label: String {
        switch self {
        case .strongBuy: return "Compra fuerte"
        case .buy: return "Compra"
        case .neutral: return "Neutral"
        case .sell: return "Venta"
        case .strongSell: return "Venta fuerte"
        }
    }
}

struct SignalComponent: Codable, Hashable {
    let name: String
    let value: Double?
    let signal: String
    let score: Double
}

struct Recommendation: Codable, Hashable {
    let signal: SignalType
    let score: Double
    let components: [SignalComponent]
    let currentRSI: Double?
    let currentMACD: Double?
    let currentBBPercent: Double?
    let priceVsEMA200: Double?
}

struct HistoryResponse: Codable, Hashable {
    let symbol: String
    let bars: [OHLCVBar]
    let indicators: IndicatorSet
    let recommendation: Recommendation
}
