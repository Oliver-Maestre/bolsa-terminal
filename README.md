# 📈 Bolsa Terminal

Dashboard financiero full-stack con datos de mercado en tiempo real, broker de paper trading, bot automático, agente de inversión IA y simulador con calculadora fiscal IRPF.

![Stack](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript%20%2B%20Vite-blue?logo=react)
![Stack](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%20%2B%20TypeScript-green?logo=node.js)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Índices globales, tabla de mercado, mis productos, recomendaciones IA y guía de inversión |
| **Screener** | Filtra activos por bolsa, señal técnica, RSI y sector. Ordenación por cualquier columna |
| **Gráfico** | Velas japonesas con MA, Bollinger Bands, RSI y MACD. Todos los períodos e intervalos |
| **Comparador** | Compara la rentabilidad acumulada de hasta 5 activos en el mismo gráfico |
| **Portfolio** | Gestiona tus posiciones manualmente con métricas y gráfico circular en tiempo real |
| **Broker** | Paper trading con $100.000 virtuales. Stop Loss, Take Profit, cambio EUR/USD en tiempo real |
| **Bot automático** | Escanea el mercado y opera solo. Modos conservador, moderado y agresivo |
| **Agente IA** | Chat con Claude AI + recomendaciones algorítmicas para corto, medio y largo plazo |
| **Simulador** | Backtesting con datos reales, proyecciones Monte Carlo y calculadora fiscal IRPF 2024 |
| **Guía del inversor** | Panel flotante contextual con consejos según la página en la que estés |

---

## 🏗️ Arquitectura

```
bolsa-terminal/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/         # Páginas principales
│   │   ├── components/    # Componentes reutilizables
│   │   ├── api/           # Cliente HTTP (axios + SWR)
│   │   ├── store/         # Estado global (Zustand + localStorage)
│   │   ├── types/         # TypeScript interfaces
│   │   └── styles/        # CSS global
│   └── vite.config.ts
│
├── backend/           # Node.js + Express + TypeScript
│   └── src/
│       ├── routes/        # Endpoints REST + SSE
│       ├── services/      # Lógica de negocio y fuentes de datos
│       ├── config/        # Mercados, tickers y configuración
│       └── types/         # Tipos compartidos
│
└── docs/              # Documentación (MD + PDF)
    ├── guia-mercados-financieros.md
    └── manual-dashboard.md
```

---

## 🔌 Fuentes de datos

El backend usa un sistema de fallback automático en cascada:

```
Yahoo Finance → Stooq → CoinGecko → FMP → Alpha Vantage → Mock
```

| Fuente | API Key | Cobertura |
|--------|---------|-----------|
| **Yahoo Finance** | No requerida | Acciones globales, ETFs, crypto, forex, índices |
| **Stooq** | No requerida | Acciones US/EU, índices, forex, crypto |
| **CoinGecko** | No requerida | Criptomonedas (30 req/min gratis) |
| **FMP** | Opcional | Acciones, ETFs, forex (250 req/día gratis) |
| **Alpha Vantage** | Opcional | Acciones US (25 req/día gratis) |

---

## 🚀 Instalación y arranque

### Requisitos
- Node.js 18+
- npm 9+

### 1. Clonar el repositorio

```bash
git clone https://github.com/Oliver-Maestre/bolsa-terminal.git
cd bolsa-terminal
```

### 2. Instalar dependencias

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configurar variables de entorno (opcional)

Crea el archivo `backend/.env`:

```env
# Claude AI — activa el chat inteligente (obtén tu clave en console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-...

# Financial Modeling Prep — fuente de datos adicional (financialmodelingprep.com)
FMP_API_KEY=tu_clave_aqui

# Alpha Vantage — fuente de datos adicional (alphavantage.co)
ALPHA_VANTAGE_KEY=tu_clave_aqui
```

> Sin estas claves el sistema funciona igualmente con Yahoo Finance, Stooq y CoinGecko (gratuitos y sin límite relevante).

### 4. Arrancar los servidores

```bash
# Terminal 1 — Backend (puerto 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (puerto 5173)
cd frontend && npm run dev
```

Abre **http://localhost:5173** en tu navegador.

---

## 🧩 Stack técnico

### Frontend
- **React 18** + **TypeScript**
- **Vite** — bundler y dev server
- **React Router v6** — navegación SPA
- **SWR** — fetching y caché de datos con auto-refresh
- **Zustand** — estado global con persistencia en localStorage
- **lightweight-charts v4** — gráficos de velas de alta performance
- **Recharts** — gráficos de portfolio (pie chart, line chart, area chart)
- **Axios** — cliente HTTP
- **react-hot-toast** — notificaciones
- **Lucide React** — iconografía

### Backend
- **Node.js** + **Express** + **TypeScript**
- **tsx watch** — hot reload en desarrollo
- **yahoo-finance2** — fuente de datos principal
- **node-cache** — caché en memoria con TTL
- **@anthropic-ai/sdk** — integración con Claude AI
- **SSE (Server-Sent Events)** — streaming del chat IA y logs del bot
- **dotenv** — gestión de variables de entorno

---

## 📊 Indicadores técnicos

El motor de análisis técnico calcula sobre datos históricos reales:

| Indicador | Descripción |
|-----------|-------------|
| **RSI** | Índice de Fuerza Relativa (14 períodos). <30 sobrevendido, >70 sobrecomprado |
| **MACD** | Convergencia/Divergencia (12/26/9). Histograma positivo = impulso alcista |
| **Bollinger Bands** | Media 20 + ±2σ. BB% indica posición relativa dentro de las bandas |
| **Score** | Puntuación compuesta 0-10 combinando RSI, MACD y BB% |

---

## 🤖 Bot de Trading

Opera automáticamente sobre la cuenta de paper trading usando señales técnicas.

| Modo | RSI máx. | Score mín. | Stop Loss | Take Profit | Posiciones |
|------|----------|-----------|-----------|-------------|------------|
| Conservador | 35 | 5/10 | 5% | 12% | 3 |
| Moderado | 42 | 4/10 | 7% | 18% | 5 |
| Agresivo | 50 | 3/10 | 10% | 25% | 8 |

---

## 🧮 Calculadora Fiscal IRPF 2024

Calcula el impacto fiscal de tus operaciones según la legislación española vigente:

- **Método FIFO** obligatorio (RD 439/2007, Art. 37.2)
- **Tramos base del ahorro**: 19% / 21% / 23% / 27% / 28%
- **Regla de los 2 meses** (Art. 33.5 LIRPF) — advertencia automática
- **Compensación de pérdidas** hasta 4 años anteriores
- Conversión automática de operaciones en **USD a EUR**

> ⚠️ La calculadora es orientativa. Consulta a un asesor fiscal para tu declaración oficial.

---

## 📁 Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `ANTHROPIC_API_KEY` | No | Activa el chat conversacional con Claude AI |
| `FMP_API_KEY` | No | Financial Modeling Prep (250 req/día gratis) |
| `ALPHA_VANTAGE_KEY` | No | Alpha Vantage (25 req/día gratis) |
| `PORT` | No | Puerto del backend (defecto: 3001) |

---

## 📄 Documentación

En la carpeta `docs/` encontrarás:

- **`guia-mercados-financieros.md`** — Guía completa para principiantes sobre mercados financieros, tipos de activos, análisis técnico/fundamental, estrategias y fiscalidad
- **`manual-dashboard.md`** — Manual de usuario detallado de todas las funcionalidades del dashboard

Ambos disponibles también en formato PDF.

---

## ⚠️ Aviso legal

Este proyecto es **educativo**. Ninguna operación del broker o del bot involucra dinero real. Las recomendaciones del agente IA y el motor algorítmico son orientativas y **no constituyen asesoramiento financiero**. Invierte siempre con criterio propio y gestiona el riesgo adecuadamente.

---

## 📝 Licencia

MIT — Usa, modifica y distribuye libremente.
