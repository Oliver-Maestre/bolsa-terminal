import Foundation

enum BotMode: String, Codable, CaseIterable {
    case conservative
    case moderate
    case aggressive

    var label: String {
        switch self {
        case .conservative: return "Conservador"
        case .moderate: return "Moderado"
        case .aggressive: return "Agresivo"
        }
    }
}

struct BotConfig: Codable, Hashable {
    let enabled: Bool
    let mode: BotMode
    let targetSymbols: [String]
    let scanInterval: Double
}

struct BotParams: Codable, Hashable {
    let minScore: Double
    let maxRSI: Double
    let stopLossPct: Double
    let takeProfitPct: Double
    let maxPositions: Int
    let positionSizePct: Double
    let sellScore: Double
}

struct BotStatus: Codable, Hashable {
    let config: BotConfig
    let params: BotParams
    let scanCount: Int
    let isRunning: Bool
    let logCount: Int
}

enum BotLogAction: String, Codable {
    case buy = "BUY"
    case sell = "SELL"
    case hold = "HOLD"
    case scan = "SCAN"
    case info = "INFO"
    case error = "ERROR"
}

struct BotLogEntry: Codable, Hashable, Identifiable {
    let id: String
    let timestamp: Double
    let action: BotLogAction
    let symbol: String?
    let price: Double?
    let quantity: Double?
    let reason: String
    let score: Double?
    let rsi: Double?
    let pnl: Double?
}
