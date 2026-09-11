import Foundation
import SwiftData

/// Local-only holdings the user enters by hand — mirrors the web app's
/// `usePortfolio` Zustand store (persisted to localStorage there, to
/// SwiftData here). Distinct from Broker, which is backend-simulated
/// trading state.
@Model
final class PortfolioPositionEntity: Identifiable {
    var id: String
    var symbol: String
    var name: String
    var quantity: Double
    var avgCost: Double
    var addedAt: Double

    init(
        id: String = UUID().uuidString,
        symbol: String,
        name: String,
        quantity: Double,
        avgCost: Double,
        addedAt: Double = Date().timeIntervalSince1970
    ) {
        self.id = id
        self.symbol = symbol
        self.name = name
        self.quantity = quantity
        self.avgCost = avgCost
        self.addedAt = addedAt
    }
}
