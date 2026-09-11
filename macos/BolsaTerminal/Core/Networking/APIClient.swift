import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case unauthorized
    case server(status: Int, message: String)
    case decoding(Error)
    case transport(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL del backend inválida. Revísala en Ajustes."
        case .unauthorized:
            return "No autorizado. Revisa el token API en Ajustes."
        case .server(let status, let message):
            return "Error del servidor (\(status))\(message.isEmpty ? "" : ": \(message)")"
        case .decoding:
            return "No se pudo interpretar la respuesta del servidor."
        case .transport(let error):
            return error.localizedDescription
        }
    }
}

final class APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private let decoder: JSONDecoder

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 20
        session = URLSession(configuration: config)
        decoder = JSONDecoder()
    }

    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        let data = try await rawData(endpoint)
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decoding(error)
        }
    }

    /// For endpoints whose response we don't need to decode (e.g. fire-and-forget POSTs).
    @discardableResult
    func rawData(_ endpoint: Endpoint) async throws -> Data {
        let request = try buildRequest(endpoint)
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.transport(error)
        }

        guard let http = response as? HTTPURLResponse else {
            throw APIError.transport(URLError(.badServerResponse))
        }
        if http.statusCode == 401 {
            throw APIError.unauthorized
        }
        guard (200..<300).contains(http.statusCode) else {
            throw APIError.server(status: http.statusCode, message: String(data: data, encoding: .utf8) ?? "")
        }
        return data
    }

    func buildRequest(_ endpoint: Endpoint) throws -> URLRequest {
        guard var components = URLComponents(url: AppSettings.shared.baseURL, resolvingAgainstBaseURL: false) else {
            throw APIError.invalidURL
        }
        components.path += endpoint.path
        if let items = endpoint.queryItems, !items.isEmpty {
            components.queryItems = items
        }
        guard let url = components.url else { throw APIError.invalidURL }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method
        if let token = KeychainStore.shared.token, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let body = endpoint.body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        return request
    }
}
