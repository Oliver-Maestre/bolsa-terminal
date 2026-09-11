import Foundation
import Observation

@Observable
final class AppSettings {
    static let shared = AppSettings()

    private let baseURLKey = "bolsa.baseURL"
    private let defaultBaseURLString = "http://localhost:3001"

    var baseURLString: String {
        didSet { UserDefaults.standard.set(baseURLString, forKey: baseURLKey) }
    }

    private init() {
        baseURLString = UserDefaults.standard.string(forKey: baseURLKey) ?? "http://localhost:3001"
    }

    var baseURL: URL {
        let trimmed = baseURLString.hasSuffix("/") ? String(baseURLString.dropLast()) : baseURLString
        return URL(string: trimmed) ?? URL(string: defaultBaseURLString)!
    }
}
