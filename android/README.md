# 📈 Bolsa Terminal — Android

App nativa de Android para [Bolsa Terminal](../README.md), escrita 100% en **Kotlin + Jetpack Compose** (sin wrappers tipo React Native/Capacitor). Consume el mismo backend Express que la web y la app macOS, con paridad funcional completa en las 9 secciones.

## Requisitos

- Android Studio (Koala o superior) o Gradle 8+ desde línea de comandos
- JDK 21
- Un emulador o dispositivo con Android 8.0+ (`minSdk = 26`)
- El [backend](../backend) corriendo en `http://localhost:3001` (`cd ../backend && npm run dev`)

## Arrancar

```bash
cd android
./gradlew assembleDebug
```

O abre la carpeta `android/` directamente en Android Studio y ejecuta `app` sobre un emulador.

> El emulador de Android usa **`10.0.2.2`** como alias del `localhost` de la máquina host (no `localhost`/`127.0.0.1`, que apuntan al propio emulador) — ya configurado por defecto en `Constants.DEFAULT_BASE_URL`.

## Configuración

La base URL y el token de API se guardan en `EncryptedSharedPreferences` (`AppSettingsProviderImpl`), pero **todavía no hay una pantalla de Ajustes en la UI** — para apuntar a un backend distinto de `http://10.0.2.2:3001` o añadir un `API_TOKEN`, cambia el valor por defecto en:

```kotlin
// core/common/src/main/java/com/bolsaterminal/core/common/Constants.kt
const val DEFAULT_BASE_URL = "http://10.0.2.2:3001"
```

o llama a `AppSettingsProviderImpl.setBaseUrl()` / `.setToken()` programáticamente.

## Arquitectura

Módulos Gradle, siguiendo separación estricta domain/data/framework + un módulo por feature:

```
android/
├── app/                     # NavHost, MainActivity (ModalNavigationDrawer con las 9 secciones), @HiltAndroidApp
├── core/
│   ├── model/                # Data classes @Serializable, mirror 1:1 de frontend/src/types/index.ts
│   ├── network/               # Retrofit + OkHttp + kotlinx.serialization, SseClient propio
│   ├── data/                  # Implementaciones de repositorio, Room (Portfolio), EncryptedSharedPreferences
│   ├── common/                 # Constants.kt
│   └── designsystem/            # Tema, colores, componentes (charts en Compose Canvas, sin librería externa)
├── domain/                  # Kotlin JVM puro — interfaces de repositorio + casos de uso
└── features/                # Un módulo por sección: dashboard, screener, chart, comparison,
                              # portfolio, broker, bot, ai, simulator
```

- **DI**: Hilt en todos los módulos Android; `:domain` es Kotlin JVM puro y usa `javax.inject` (no puede depender de Hilt).
- **Networking**: Retrofit + `kotlinx.serialization` (convertidor real: `com.jakewharton.retrofit2.converter.kotlinx.serialization`, no `retrofit2.converter...`).
- **SSE**: `SseClient` (OkHttp, GET/POST) parsea `data: {...}\n\n` línea a línea — mismo formato que `backend/src/routes/bot.ts` y `ai.ts`. Usado por Bot (log en vivo) y AI (chat con streaming).
- **Gráficos**: `Canvas` de Compose puro (velas, volumen, líneas de indicadores) — sin librería de charts externa. Cualquier `Canvas` nuevo necesita tamaño explícito (`fillMaxWidth().height(...)`) o colapsa a ancho cero sin dar error.
- **Portfolio vs. Broker**: `Portfolio` son holdings introducidos a mano, persistidos localmente con **Room** (nunca llama al broker del backend). `Broker` es cliente puro de `/api/broker/*` — el trading simulado real vive en el backend. No confundir ambos al tocar código.
- **Simulador**: `domain/.../tax/IrpfCalculator.kt` es un puerto directo (FIFO + tramos IRPF 2024) de la lógica del simulador de la web, con tests unitarios en `domain/src/test`.
- **Layouts de teléfono**: evitar anchos fijos en `dp` en formularios/sidebars — usar `Modifier.weight(1f)` y apilar verticalmente (`Column`) en vez de layouts lado a lado tipo tablet/desktop.

## Tests

```bash
./gradlew test        # Unit tests (JVM) — incluye IrpfCalculatorTest
./gradlew connectedAndroidTest   # Instrumentados, requiere emulador/dispositivo
```
