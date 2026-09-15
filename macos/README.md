# 📈 Bolsa Terminal — macOS

App nativa de macOS para [Bolsa Terminal](../README.md), escrita 100% en **SwiftUI** (sin wrappers tipo Electron/Tauri). Consume el mismo backend Express que la web y la app Android, con paridad funcional completa en las 9 secciones.

## Requisitos

- macOS 14 (Sonoma) o superior
- Xcode 15+
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) (`brew install xcodegen`) — el `.xcodeproj` se genera a partir de `project.yml`, no se edita a mano
- El [backend](../backend) corriendo en `http://localhost:3001` (`cd ../backend && npm run dev`)

## Arrancar

```bash
cd macos
xcodegen generate
open BolsaTerminal.xcodeproj
```

Compila y ejecuta con ⌘R. La app no está firmada para desarrollo local (`CODE_SIGNING_ALLOWED=NO` en `project.yml`) — no hace falta una cuenta de Apple Developer para probarla.

## Configuración

Desde la pestaña **Ajustes** de la app puedes cambiar:
- **Base URL del backend** — por defecto `http://localhost:3001`. Si despliegas el backend en la nube, apunta aquí a esa URL.
- **Token de API** — solo necesario si el backend tiene `API_TOKEN` configurado (ver [variables de entorno del backend](../README.md#-variables-de-entorno)); se guarda en Keychain, nunca en texto plano.

## Arquitectura

```
BolsaTerminal/
├── App/                    # Entry point (BolsaTerminalApp.swift) y ContentView (sidebar + navegación)
├── Core/
│   ├── Networking/         # APIClient (URLSession async/await), SSEClient, Endpoints (mirror 1:1 de frontend/src/api/client.ts)
│   ├── Models/              # Codable, mirror 1:1 de frontend/src/types/index.ts
│   └── Storage/             # KeychainStore (token), AppSettings (base URL en UserDefaults)
├── DesignSystem/           # Colores, tipografía, componentes reutilizables (SignalBadge, ErrorBanner...)
├── Features/                # Un directorio MVVM por sección: Dashboard, Screener, Chart, Comparison,
│                            # Portfolio, Broker, Bot, AI, Simulator
└── Settings/                # Pantalla de configuración (base URL, token)
```

- **MVVM**: cada feature tiene su `View` + `ViewModel` (`@Observable`), sin dependencias de terceros más allá de las de Apple.
- **Gráfico de velas**: Swift Charts nativo — sin `CandlestickMark` de fábrica, se construye por barra combinando `RuleMark` (mecha) + `RectangleMark` (cuerpo).
- **Portfolio vs. Broker**: `Portfolio` son holdings introducidos a mano, persistidos localmente con **SwiftData** (nunca llama al broker del backend). `Broker` es cliente puro de `/api/broker/*` — el trading simulado real vive en el backend, no en el dispositivo. No confundir ambos al tocar código.
- **SSE**: `SSEClient` parsea `data: {...}\n\n` sobre `URLSession.bytes(for:)`, usado por Bot (log en vivo) y AI (chat con streaming token a token).
- **Simulador**: `IrpfCalculator.swift` es un puerto directo (FIFO + tramos IRPF 2024) de la lógica del simulador de la web.

## Notas

- `NSAllowsLocalNetworking: true` en `Info.plist` permite conectar a `localhost` en desarrollo (App Transport Security de macOS bloquea HTTP en claro por defecto).
- Los campos de indicadores técnicos (RSI/MACD/EMA en periodos cortos) son opcionales (`Double?`) porque el backend serializa `NaN` como `null` en JSON durante el warmup del indicador.
- Cada pantalla de datos (Dashboard, Screener, Chart, Comparison, Portfolio, Broker) se refresca sola cada 60s mientras está en pantalla, sin parpadeo de spinner (un método `refresh()` silencioso junto al `load()` inicial) — se detiene solo al salir de la vista. Bot/AI usan SSE en vivo, no polling; Simulator es un formulario de un solo uso.

## Icono y distribución

- El icono (`BolsaTerminal/Assets.xcassets/AppIcon.appiconset`) usa la paleta del design system (fondo `btBackground`/`btSecondary`, velas verde/rojo, línea de tendencia en `btAccent`). Generado con Pillow — script de referencia en el historial de esta sesión, no versionado (es un asset estático, no build step).
- **Generar el instalador DMG** (`.app` sin firmar — ad-hoc, `CODE_SIGN_IDENTITY: "-"` — no hay cuenta de Apple Developer; al abrirlo por primera vez macOS pedirá "clic derecho → Abrir" o Ajustes → Privacidad y seguridad → "Abrir de todos modos"):
  ```bash
  cd macos
  xcodegen generate
  xcodebuild -project BolsaTerminal.xcodeproj -scheme BolsaTerminal -configuration Release -derivedDataPath ./DerivedDataRelease build

  STAGING=$(mktemp -d)
  cp -R "DerivedDataRelease/Build/Products/Release/Bolsa Terminal.app" "$STAGING/"
  ln -s /Applications "$STAGING/Applications"
  mkdir -p dist
  hdiutil create -volname "Bolsa Terminal" -srcfolder "$STAGING" -ov -format UDZO dist/BolsaTerminal-Installer.dmg
  ```
  Resultado en `macos/dist/BolsaTerminal-Installer.dmg` (no versionado, se regenera bajo demanda). Instalación: abrir el DMG, arrastrar **Bolsa Terminal** a **Applications**.
