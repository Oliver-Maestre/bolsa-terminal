import SwiftUI

struct AiChatView: View {
    @State private var viewModel = AiChatViewModel()

    var body: some View {
        VStack(spacing: 0) {
            if let available = viewModel.aiAvailable, !available {
                Text("IA no disponible: el backend no tiene configurada la clave de Anthropic (ANTHROPIC_API_KEY).")
                    .font(.caption)
                    .foregroundStyle(Color.btTextSecondary)
                    .padding(10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.btCard)
            }

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 12) {
                        ForEach(viewModel.messages) { message in
                            ChatBubble(message: message)
                                .id(message.id)
                        }
                    }
                    .padding(16)
                }
                .onChange(of: viewModel.messages.count) { _, _ in
                    if let last = viewModel.messages.last {
                        withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                    }
                }
            }

            if let error = viewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(Color.btRed)
                    .padding(.horizontal, 16)
            }

            Divider().overlay(Color.btBorder)

            HStack(spacing: 10) {
                TextField("Pregunta algo sobre los mercados…", text: $viewModel.inputText, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(1...4)
                    .onSubmit { viewModel.send() }
                Button {
                    viewModel.send()
                } label: {
                    if viewModel.isStreaming {
                        ProgressView().controlSize(.small)
                    } else {
                        Image(systemName: "arrow.up.circle.fill").font(.title2)
                    }
                }
                .buttonStyle(.plain)
                .disabled(viewModel.isStreaming || viewModel.inputText.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            .padding(12)
        }
        .background(Color.btBackground)
        .navigationTitle("IA")
        .task { await viewModel.checkAvailability() }
    }
}
