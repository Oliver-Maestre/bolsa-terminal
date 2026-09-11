import SwiftUI

struct SettingsView: View {
    @State private var baseURL: String = AppSettings.shared.baseURLString
    @State private var token: String = KeychainStore.shared.token ?? ""
    @State private var savedMessage: String?

    var body: some View {
        Form {
            Section("Backend") {
                TextField("URL base", text: $baseURL, prompt: Text("http://localhost:3001"))
                    .textFieldStyle(.roundedBorder)
                SecureField("Token API", text: $token)
                    .textFieldStyle(.roundedBorder)
            }
            HStack {
                if let savedMessage {
                    Text(savedMessage)
                        .font(.caption)
                        .foregroundStyle(Color.btGreen)
                }
                Spacer()
                Button("Guardar") { save() }
                    .buttonStyle(.borderedProminent)
            }
        }
        .padding(20)
        .frame(width: 420, height: 180)
    }

    private func save() {
        AppSettings.shared.baseURLString = baseURL.trimmingCharacters(in: .whitespaces)
        KeychainStore.shared.token = token.trimmingCharacters(in: .whitespaces)
        savedMessage = "Guardado"
    }
}
