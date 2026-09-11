import Foundation

enum OrderSide: String, Codable {
    case buy = "BUY"
    case sell = "SELL"
}

enum OrderStatus: String, Codable {
    case filled = "FILLED"
    case cancelled = "CANCELLED"
    case rejected = "REJECTED"
}

enum TradeSource: String, Codable {
    case manual = "MANUAL"
    case bot = "BOT"
}

struct BrokerOrder: Codable, Hashable, Identifiable {
    let id: String
    let symbol: String
    let side: OrderSide
    let quantity: Double
    let price: Double
    let total: Double
    let fee: Double
    let status: OrderStatus
    let timestamp: Double
    let source: TradeSource
    let reason: String?
}

struct BrokerPosition: Codable, Hashable, Identifiable {
    var id: String { symbol }
    let symbol: String
    let quantity: Double
    let avgCost: Double
    let currentPrice: Double
    let value: Double
    let cost: Double
    let pnl: Double
    let pnlPct: Double
    let stopLoss: Double?
    let takeProfit: Double?
    let openedAt: Double
    let source: TradeSource
}

struct BrokerAccount: Codable, Hashable {
    let cash: Double
    let initialBalance: Double
    let positions: [BrokerPosition]
    let orders: [BrokerOrder]
    let totalEquity: Double
    let totalCost: Double
    let totalPnL: Double
    let totalPnLPct: Double
    let totalFeesPaid: Double
    let tradeCount: Int
    let winCount: Int
    let lossCount: Int
    let winRate: Double
}
