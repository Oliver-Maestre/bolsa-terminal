import Foundation
import Observation

struct ChatDisplayMessage: Identifiable, Hashable {
    let id = UUID()
    let role: String // "user" | "assistant"
    var content: String
}

@MainActor
@Observable
final class AiChatViewModel {
    private struct OutgoingMessage: Encodable {
        let role: String
        let content: String
    }
    private struct ChatPayload: Encodable {
        let messages: [OutgoingMessage]
    }
    private struct StreamChunk: Decodable {
        let chunk: String?
        let done: Bool?
        let error: String?
    }
    private struct StatusResponse: Decodable {
        let available: Bool
        let model: String
    }

    var messages: [ChatDisplayMessage] = []
    var inputText: String = ""
    var isStreaming = false
    var errorMessage: String?
    var aiAvailable: Bool?

    private let sseClient = SSEClient()

    func checkAvailability() async {
        do {
            let status: StatusResponse = try await APIClient.shared.request(Endpoints.aiStatus)
            aiAvailable = status.available
        } catch {
            aiAvailable = nil
        }
    }

    func send() {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, !isStreaming else { return }
        inputText = ""
        errorMessage = nil
        messages.append(ChatDisplayMessage(role: "user", content: text))

        let assistantIndex = messages.count
        messages.append(ChatDisplayMessage(role: "assistant", content: ""))

        let payload = ChatPayload(messages: messages.dropLast().map { OutgoingMessage(role: $0.role, content: $0.content) })
        guard let body = try? JSONEncoder().encode(payload) else { return }

        isStreaming = true
        sseClient.connect(endpoint: Endpoints.aiChat(body)) { [weak self] data in
            guard let self else { return }
            Task { @MainActor in
                guard let event = try? JSONDecoder().decode(StreamChunk.self, from: data) else { return }
                if let chunk = event.chunk, assistantIndex < self.messages.count {
                    self.messages[assistantIndex].content += chunk
                }
                if let error = event.error {
                    self.errorMessage = error
                }
            }
        } onComplete: { [weak self] error in
            Task { @MainActor in
                guard let self else { return }
                self.isStreaming = false
                if let error {
                    self.errorMessage = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
                }
            }
        }
    }
}
