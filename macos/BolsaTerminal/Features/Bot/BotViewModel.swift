import Foundation
import Observation

@MainActor
@Observable
final class BotViewModel {
    enum State {
        case idle, loading, loaded, error(String)
    }

    private struct ConfigPayload: Encodable {
        let enabled: Bool?
        let mode: String?
        let targetSymbols: [String]?
        let scanInterval: Double?
    }

    var state: State = .idle
    var status: BotStatus?
    var log: [BotLogEntry] = []
    var isStreaming = false

    var selectedMode: BotMode = .moderate
    var targetSymbolsText: String = ""
    var scanInterval: String = "60"

    private let sseClient = SSEClient()
    private let decoder = JSONDecoder()

    func load() async {
        state = .loading
        do {
            let fetchedStatus: BotStatus = try await APIClient.shared.request(Endpoints.botStatus)
            let fetchedLog: [BotLogEntry] = try await APIClient.shared.request(Endpoints.botLog(limit: 100))
            status = fetchedStatus
            log = fetchedLog
            selectedMode = fetchedStatus.config.mode
            scanInterval = String(Int(fetchedStatus.config.scanInterval))
            targetSymbolsText = fetchedStatus.config.targetSymbols.joined(separator: ", ")
            state = .loaded
            startStreaming()
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }

    func startStreaming() {
        guard !isStreaming else { return }
        isStreaming = true
        sseClient.connect(endpoint: Endpoints.botStream) { [weak self] data in
            guard let self else { return }
            Task { @MainActor in
                guard let newEntries = try? self.decoder.decode([BotLogEntry].self, from: data) else { return }
                let existingIds = Set(self.log.map(\.id))
                let toInsert = newEntries.filter { !existingIds.contains($0.id) }
                guard !toInsert.isEmpty else { return }
                self.log = (toInsert + self.log)
                if self.log.count > 300 { self.log = Array(self.log.prefix(300)) }
            }
        } onComplete: { [weak self] _ in
            Task { @MainActor in self?.isStreaming = false }
        }
    }

    func stopStreaming() {
        sseClient.cancel()
        isStreaming = false
    }

    func toggleEnabled() async {
        guard let status else { return }
        await configure(enabled: !status.config.enabled)
    }

    func applyConfig() async {
        let symbols = targetSymbolsText
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces).uppercased() }
            .filter { !$0.isEmpty }
        await configure(mode: selectedMode, targetSymbols: symbols, scanInterval: Double(scanInterval) ?? 60)
    }

    private func configure(
        enabled: Bool? = nil,
        mode: BotMode? = nil,
        targetSymbols: [String]? = nil,
        scanInterval: Double? = nil
    ) async {
        let payload = ConfigPayload(
            enabled: enabled, mode: mode?.rawValue, targetSymbols: targetSymbols, scanInterval: scanInterval
        )
        do {
            let body = try JSONEncoder().encode(payload)
            status = try await APIClient.shared.request(Endpoints.botConfigure(body))
        } catch {
            state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
        }
    }
}
