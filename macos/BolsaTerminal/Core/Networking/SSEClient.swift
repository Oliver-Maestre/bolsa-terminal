import Foundation

/// Minimal Server-Sent Events client matching the backend's framing
/// (`data: {...}\n\n`, one JSON payload per line — see routes/bot.ts::/stream
/// and routes/ai.ts::/chat). Shared by Bot log streaming and AI chat streaming.
final class SSEClient {
    enum SSEError: Error {
        case unauthorized
        case server(Int)
    }

    private var task: Task<Void, Never>?

    func connect(
        endpoint: Endpoint,
        onEvent: @escaping (Data) -> Void,
        onComplete: @escaping (Error?) -> Void
    ) {
        task?.cancel()
        task = Task {
            do {
                let request = try APIClient.shared.buildRequest(endpoint)
                let (bytes, response) = try await URLSession.shared.bytes(for: request)

                guard let http = response as? HTTPURLResponse else {
                    onComplete(SSEError.server(-1))
                    return
                }
                if http.statusCode == 401 {
                    onComplete(SSEError.unauthorized)
                    return
                }
                guard (200..<300).contains(http.statusCode) else {
                    onComplete(SSEError.server(http.statusCode))
                    return
                }

                for try await line in bytes.lines {
                    if Task.isCancelled { return }
                    guard line.hasPrefix("data: ") else { continue }
                    let payload = String(line.dropFirst(6))
                    if let data = payload.data(using: .utf8) {
                        onEvent(data)
                    }
                }
                onComplete(nil)
            } catch {
                if !Task.isCancelled {
                    onComplete(error)
                }
            }
        }
    }

    func cancel() {
        task?.cancel()
        task = nil
    }
}
