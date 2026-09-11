import SwiftUI

struct BotView: View {
    @State private var viewModel = BotViewModel()

    var body: some View {
        Group {
            switch viewModel.state {
            case .idle, .loading:
                ProgressView("Cargando bot…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            case .error(let message):
                ErrorBanner(message: message) { Task { await viewModel.load() } }
            case .loaded:
                content
            }
        }
        .background(Color.btBackground)
        .navigationTitle("Bot")
        .task { await viewModel.load() }
        .onDisappear { viewModel.stopStreaming() }
    }

    private var content: some View {
        HStack(alignment: .top, spacing: 16) {
            configPanel.frame(width: 280)
            logPanel.frame(maxWidth: .infinity)
        }
        .padding(20)
    }

    private var configPanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Configuración")
                    .font(.headline)
                    .foregroundStyle(Color.btTextPrimary)
                Spacer()
                if let status = viewModel.status {
                    Circle()
                        .fill(status.isRunning ? Color.btGreen : Color.btTextMuted)
                        .frame(width: 8, height: 8)
                }
            }

            Picker("Modo", selection: $viewModel.selectedMode) {
                ForEach(BotMode.allCases, id: \.self) { mode in
                    Text(mode.label).tag(mode)
                }
            }
            .pickerStyle(.segmented)

            TextField("Símbolos objetivo (vacío = todos)", text: $viewModel.targetSymbolsText)
                .textFieldStyle(.roundedBorder)
            TextField("Intervalo de escaneo (s)", text: $viewModel.scanInterval)
                .textFieldStyle(.roundedBorder)

            Button("Aplicar configuración") { Task { await viewModel.applyConfig() } }
                .buttonStyle(.bordered)

            Divider().overlay(Color.btBorder)

            if let status = viewModel.status {
                Button(status.config.enabled ? "Detener bot" : "Iniciar bot") {
                    Task { await viewModel.toggleEnabled() }
                }
                .buttonStyle(.borderedProminent)
                .tint(status.config.enabled ? .btRed : .btGreen)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Escaneos: \(status.scanCount)")
                        .font(.caption).foregroundStyle(Color.btTextSecondary)
                    Text("Min score: \(String(format: "%.0f", status.params.minScore)) · Max RSI: \(String(format: "%.0f", status.params.maxRSI))")
                        .font(.caption).foregroundStyle(Color.btTextSecondary)
                    Text("SL: \(String(format: "%.0f", status.params.stopLossPct))% · TP: \(String(format: "%.0f", status.params.takeProfitPct))%")
                        .font(.caption).foregroundStyle(Color.btTextSecondary)
                }
            }
        }
        .padding(14)
        .background(Color.btCard)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.btBorder, lineWidth: 1))
    }

    private var logPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Actividad en vivo")
                .font(.headline)
                .foregroundStyle(Color.btTextPrimary)
            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(viewModel.log) { entry in
                        BotLogRow(entry: entry)
                        if entry.id != viewModel.log.last?.id {
                            Divider().overlay(Color.btBorder)
                        }
                    }
                }
            }
            .background(Color.btCard)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.btBorder, lineWidth: 1))
        }
    }
}
