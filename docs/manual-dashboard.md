# Manual de Usuario — Bolsa Terminal

> Guía completa de todas las funcionalidades del dashboard: cómo navegar, interpretar datos y ejecutar cada tarea disponible.

---

## Índice

1. [Estructura general de la aplicación](#1-estructura-general-de-la-aplicación)
2. [Dashboard principal — Mercados](#2-dashboard-principal--mercados)
3. [Screener de Mercados](#3-screener-de-mercados)
4. [Gráfico de activo](#4-gráfico-de-activo)
5. [Comparador de Activos](#5-comparador-de-activos)
6. [Portfolio personal](#6-portfolio-personal)
7. [Broker Paper Trading](#7-broker-paper-trading)
8. [Bot de Trading Automático](#8-bot-de-trading-automático)
9. [Agente de Inversión IA](#9-agente-de-inversión-ia)
10. [Simulador de Inversiones](#10-simulador-de-inversiones)
11. [Watchlist y navegación lateral](#11-watchlist-y-navegación-lateral)
12. [Guía del Inversor (asistente flotante)](#12-guía-del-inversor-asistente-flotante)
13. [Fuentes de datos y fiabilidad](#13-fuentes-de-datos-y-fiabilidad)
14. [Glosario rápido](#14-glosario-rápido)

---

## 1. Estructura general de la aplicación

La aplicación se divide en tres zonas visuales:

```
┌──────────────────────────────────────────────────────┐
│  BARRA SUPERIOR (TopBar)  —  búsqueda + estado       │
├──────────────┬───────────────────────────────────────┤
│              │                                       │
│  SIDEBAR     │   ÁREA PRINCIPAL (contenido)          │
│  Navegación  │                                       │
│  Watchlist   │                                       │
│  Estado mdo. │                                       │
│              │                                       │
└──────────────┴───────────────────────────────────────┘
                          [Guía ⊕]  ← botón flotante
```

### Barra superior (TopBar)
- **Buscador**: escribe cualquier símbolo (AAPL, BTC-USD, SAN.MC…) o nombre de empresa. Pulsa Enter o haz clic en el resultado para abrir su gráfico.
- El buscador busca en tiempo real mientras escribes.

### Sidebar izquierda
- **Navegación principal**: acceso a todas las secciones.
- **Watchlist**: lista de activos favoritos con precio y variación en tiempo real. Actualiza cada 15 segundos.
- **Estado del mercado**: indicador verde/rojo de si NYSE/NASDAQ, Bolsa de Madrid y Crypto están abiertos ahora mismo.

### Botón "Guía" (esquina inferior derecha)
- Panel deslizante con consejos contextuales según la página en la que estés.
- Guías paso a paso para comprar, vender, usar el screener, gestión del riesgo y fiscalidad.

---

## 2. Dashboard principal — Mercados

**Ruta**: `/` (pantalla de inicio)

El dashboard tiene 4 secciones accesibles mediante pestañas en la parte superior:

### 2.1 Pestaña "Mercados"

#### Índices Globales
Muestra los principales índices mundiales en tiempo real:

| Índice | Qué representa |
|--------|----------------|
| S&P 500 | Las 500 mayores empresas de EE.UU. |
| NASDAQ | Tecnología americana |
| Dow Jones | Las 30 empresas más importantes de EE.UU. |
| IBEX 35 | Las 35 mayores empresas españolas |
| FTSE 100 | Las 100 mayores empresas del Reino Unido |
| Bitcoin | Precio del bitcoin en USD |

**Cómo leerlos**: el número grande es el precio actual. El % en verde/rojo es la variación respecto al cierre anterior del día.

#### Filtros por bolsa
Debajo de los índices hay pestañas para filtrar la tabla de activos:

- **Todo**: todos los activos monitorizados juntos.
- **NYSE / NASDAQ**: acciones americanas.
- **Madrid (BME)**: acciones españolas (sufijo .MC).
- **Londres (LSE)**: acciones británicas (sufijo .L).
- **Crypto**: criptomonedas (BTC-USD, ETH-USD…).

#### Tabla de mercado
Columnas disponibles:

| Columna | Significado |
|---------|-------------|
| **Símbolo** | Identificador del activo. Haz clic para abrir su gráfico. |
| **Nombre** | Nombre de la empresa o activo. |
| **Precio** | Último precio negociado. |
| **Cambio %** | Variación porcentual del día (verde = sube, rojo = baja). |
| **Volumen** | Nº de acciones/unidades negociadas hoy. |
| **RSI** | Índice de fuerza relativa (0-100). Ver sección indicadores. |
| **MACD** | Histograma MACD. Positivo = impulso alcista. |
| **Score** | Puntuación algorítmica 0-10. >6 = señal positiva. |
| **Señal** | BUY / SELL / NEUTRAL según los indicadores técnicos. |
| **★** | Añade/quita el activo de tu Watchlist. |

**Ordenar**: haz clic en cualquier cabecera de columna para ordenar ascendente/descendente.

**Abrir gráfico**: haz clic en el símbolo o en el nombre del activo.

---

### 2.2 Pestaña "Mis Productos"

Muestra un resumen de todas tus posiciones abiertas:
- **Posiciones del Portfolio** (activos añadidos manualmente).
- **Posiciones del Broker** (operaciones de paper trading activas).

Cada tarjeta muestra: símbolo, nombre, precio actual, P&L (ganancia/pérdida), cantidad, y niveles de Stop Loss y Take Profit si los tienes configurados.

- Botón **Ver Portfolio** → va a la página de Portfolio completa.
- Botón **Ir al Broker** → va a la página de Broker.

---

### 2.3 Pestaña "IA Recomendaciones"

Muestra las recomendaciones algorítmicas actualizadas de la IA para los tres horizontes temporales:

- **Corto plazo** (1-15 días): activos con señales de momentum inmediato.
- **Medio plazo** (1-3 meses): activos con tendencia sostenida.
- **Largo plazo** (6-24 meses): activos con fundamentos y tendencia estructural.

Cada tarjeta de recomendación incluye:
- Zona de entrada (precio de compra sugerido).
- Stop Loss recomendado.
- Take Profit objetivo.
- Ratio Riesgo:Recompensa.
- RSI actual y puntuación de confianza (barra de progreso).

Botón **Chat con IA** → abre la página de Agente IA para consultar directamente.

---

### 2.4 Pestaña "Guía de Inversión"

Tutorial interactivo de 6 pasos para inversores principiantes:
1. Entender el mercado.
2. Elegir dónde invertir.
3. Analizar con el Screener.
4. Leer el gráfico.
5. Ejecutar tu primera operación.
6. Gestionar el riesgo.

Cada paso se puede expandir, marcar como completado, y tiene accesos directos a las herramientas relevantes.

---

## 3. Screener de Mercados

**Ruta**: `/screener`

El Screener analiza todos los activos monitorizados y permite filtrarlos por señales técnicas.

### Cómo usar el Screener

**Paso 1 — Selecciona la bolsa**
Usa las pestañas superiores: Todos / NYSE / NASDAQ / BME / LSE / Crypto.

**Paso 2 — Aplica filtros**
- **Señal**: BUY (señal alcista), SELL (bajista), NEUTRAL (sin señal clara).
- **RSI mínimo/máximo**: filtra por rango de RSI (ej: 0-40 para sobrevendidos).
- **Sector**: Tecnología, Finanzas, Energía, Salud, etc.

**Paso 3 — Ordena los resultados**
Haz clic en las cabeceras para ordenar por Score (mayor primero es lo más habitual).

**Paso 4 — Abre el activo que te interese**
Haz clic en el símbolo para ver el gráfico completo con indicadores y recomendación.

### Estrategia de uso recomendada
1. Filtra por **Señal = BUY** + **RSI < 40** → activos sobrevendidos con señal alcista.
2. Ordena por **Score** descendente.
3. Abre el gráfico de los 3 primeros candidatos.
4. Confirma la tendencia visual antes de operar.

---

## 4. Gráfico de Activo

**Ruta**: `/chart/:SIMBOLO` (accesible desde cualquier tabla o buscador)

### Elementos del gráfico

#### Panel izquierdo — Gráfico de velas
El gráfico de velas (candlestick) muestra:

- **Vela verde**: el precio cerró por encima de la apertura (día alcista).
- **Vela roja**: el precio cerró por debajo de la apertura (día bajista).
- **Mecha superior**: precio máximo del período.
- **Mecha inferior**: precio mínimo del período.
- **Cuerpo**: rango entre apertura y cierre.

#### Indicadores superpuestos (activables/desactivables)

| Indicador | Qué muestra | Cómo leerlo |
|-----------|-------------|-------------|
| **MA (Media Móvil)** | Línea suavizada de la tendencia | Precio sobre la MA = tendencia alcista. Precio bajo la MA = bajista. |
| **Bollinger Bands** | Banda superior e inferior en torno a la MA | Precio en banda inferior = posible soporte. Precio en banda superior = posible resistencia. |
| **RSI** | Panel separado debajo, rango 0-100 | <30 sobrevendido (posible compra). >70 sobrecomprado (posible venta). |
| **MACD** | Histograma de barras + líneas | Barras verdes = impulso alcista. Barras rojas = impulso bajista. |

#### Controles de período e intervalo

| Período | Útil para |
|---------|-----------|
| 1d / 5d | Análisis intradiario |
| 1mo / 3mo | Corto plazo |
| 6mo / 1y | Medio plazo |
| 2y / 5y / 10y | Largo plazo, análisis de ciclos |

| Intervalo | Descripción |
|-----------|-------------|
| 1d | Una vela = un día |
| 1wk | Una vela = una semana |
| 1mo | Una vela = un mes |

#### Panel derecho — Datos del activo

**Cabecera de cotización** (QuoteHeader):
- Precio actual, variación del día.
- Precio de apertura, máximo y mínimo del día.
- Volumen del día.
- Capitalización de mercado.
- Máximos y mínimos de 52 semanas.
- Botón **+ Portfolio**: añade este activo a tu portfolio personal.

**Tarjeta de recomendación** (RecommendationCard):
- Señal: BUY / SELL / NEUTRAL.
- Score técnico 0-10.
- RSI, MACD, Bollinger % actuales.
- Rango de precio sugerido para entrada.
- Stop Loss y Take Profit calculados automáticamente.
- Ratio Riesgo:Recompensa.

### Tareas disponibles desde el gráfico
- **Añadir a Watchlist**: botón estrella ★ en la cabecera.
- **Añadir al Portfolio**: botón "+ Portfolio" en la cabecera.
- **Zoom**: rueda del ratón sobre el gráfico.
- **Desplazar**: clic y arrastrar horizontalmente.

---

## 5. Comparador de Activos

**Ruta**: `/comparison`

Permite comparar la evolución porcentual de hasta 5 activos en el mismo gráfico, normalizados desde el 0% en un punto de partida común.

### Cómo usar el Comparador

1. Los activos por defecto son AAPL, MSFT, NVDA.
2. **Añadir activo**: escribe el símbolo en el campo de búsqueda y pulsa Añadir.
3. **Eliminar activo**: haz clic en la × junto al símbolo.
4. **Seleccionar período**: cambia el rango temporal para ver la comparativa histórica.
5. **Pasar el ratón** sobre el gráfico para ver los valores exactos de cada activo en esa fecha.

### Interpretación
- La línea que queda más arriba al final del período tiene mejor rentabilidad acumulada.
- Una línea que empieza a divergir al alza respecto al resto indica fuerza relativa (outperformance).
- Una línea que cae mientras las demás suben indica debilidad relativa.

---

## 6. Portfolio Personal

**Ruta**: `/portfolio`

El portfolio guarda tus posiciones manualmente y calcula métricas en tiempo real.

> **Nota**: los datos del portfolio se guardan en el navegador (localStorage). Son persistentes entre sesiones pero no se sincronizan con un servidor.

### Añadir una posición

1. Haz clic en el botón **+ Añadir posición** (esquina superior derecha).
2. Rellena el formulario:
   - **Símbolo**: ej. AAPL, BTC-USD, SAN.MC.
   - **Cantidad**: número de acciones o unidades.
   - **Precio de coste**: precio al que compraste (por unidad).
   - **Fecha de compra**: fecha de la operación.
   - **Notas**: campo libre (opcional).
3. Haz clic en **Guardar**.

También puedes añadir desde el gráfico de cualquier activo con el botón **+ Portfolio**.

### Vista del portfolio

**Tarjetas de resumen** (parte superior):
- **Valor total**: suma del valor actual de todas las posiciones.
- **Coste total**: suma de lo que pagaste.
- **P&L total**: ganancia o pérdida total en dinero.
- **Rentabilidad %**: retorno porcentual global.
- **Mejor posición**: la que más ha subido.
- **Peor posición**: la que más ha bajado.

**Gráfico circular**: distribución del capital por activo.

**Tabla de posiciones**: todas tus posiciones con precio actual, P&L individual y variación del día. Actualiza automáticamente cada 15 segundos.

### Editar o eliminar una posición

- **Editar**: haz clic en el icono de lápiz ✏️ de la fila.
- **Eliminar**: haz clic en el icono de papelera 🗑️ de la fila.

---

## 7. Broker Paper Trading

**Ruta**: `/broker`

El broker simula operaciones reales con **capital virtual de $100.000**. No se mueve dinero real.

### Cambiar moneda (USD / EUR)

En la esquina superior derecha hay un selector **$ USD / € EUR**. Al cambiar:
- Todos los precios, P&L, totales y comisiones se convierten a la moneda seleccionada.
- El tipo de cambio EUR/USD se actualiza en tiempo real (EURUSD=X).
- Se muestra la equivalencia en la otra moneda como referencia secundaria.

### Panel de métricas de cuenta

| Métrica | Significado |
|---------|-------------|
| **Capital Total** | Efectivo + valor actual de todas las posiciones. |
| **Efectivo** | Dinero disponible para nuevas compras. |
| **P&L Total** | Ganancia o pérdida acumulada desde el inicio. |
| **Posiciones** | Número de posiciones abiertas actualmente. |
| **Win Rate** | % de operaciones cerradas con ganancia. |

### Ejecutar una orden de COMPRA

1. En el panel de la derecha **"Nueva Orden"**, selecciona **COMPRAR**.
2. Escribe el **símbolo** del activo (ej: AAPL).
3. El precio de mercado actual aparece automáticamente.
4. Elige el **modo de cantidad**:
   - **Nº acciones**: introduce cuántas acciones quieres comprar.
   - **Importe €/$**: introduce el dinero que quieres invertir. El sistema calcula automáticamente las acciones.
5. (Opcional) Introduce **Stop Loss**: precio al que la posición se cerrará automáticamente si baja.
6. (Opcional) Introduce **Take Profit**: precio objetivo de ganancia.
7. El resumen "Estimado" muestra el coste total + comisión (0,1%).
8. Haz clic en **Comprar [SÍMBOLO]**.

### Ejecutar una orden de VENTA

1. Selecciona **VENDER** en el panel.
2. Escribe el símbolo.
3. Introduce la cantidad o importe.
4. Haz clic en **Vender [SÍMBOLO]**.

O desde la tabla de posiciones abiertas, haz clic en el botón **Vender** de la fila del activo (cierra toda la posición de ese activo).

### Pestaña "Posiciones abiertas"

Tabla con todas las posiciones activas:
- Precio de coste medio, precio actual, valor, P&L absoluto y porcentual.
- Stop Loss y Take Profit configurados.
- Fuente de datos (Yahoo, Stooq, etc.).
- Botón **Vender** para cerrar la posición completa.
- **Clic en el símbolo** para abrir el gráfico.

### Pestaña "Historial de operaciones"

Registro de todas las compras y ventas ejecutadas:
- Fecha, símbolo, lado (BUY/SELL), cantidad, precio, total y comisión.

### Reiniciar la cuenta

Botón **Reiniciar cuenta** (esquina inferior derecha del resumen). Devuelve el capital a $100.000 y borra todo el historial. **Esta acción es irreversible**.

---

## 8. Bot de Trading Automático

**Ruta**: `/bot`

El bot escanea el mercado automáticamente y ejecuta órdenes de compra/venta en la cuenta de paper trading sin intervención manual.

> **Importante**: el bot opera siempre con capital virtual. No ejecuta órdenes reales.

### Modos de operación

| Modo | RSI máx. compra | Score mín. | Stop Loss | Take Profit | Máx. posiciones |
|------|-----------------|-----------|-----------|-------------|-----------------|
| **Conservador** | 35 | 5/10 | 5% | 12% | 3 |
| **Moderado** | 42 | 4/10 | 7% | 18% | 5 |
| **Agresivo** | 50 | 3/10 | 10% | 25% | 8 |

### Configurar y activar el bot

1. Selecciona el **modo** (Conservador / Moderado / Agresivo).
2. Ajusta el **intervalo de escaneo** (en segundos) — mínimo recomendado: 60s.
3. Ajusta el **tamaño de posición** (% del capital por operación).
4. Haz clic en **Iniciar Bot**.

### Cómo funciona el bot

1. **Escanea** todos los activos del screener según el intervalo configurado.
2. **Filtra** los que cumplen las condiciones del modo (RSI, score, señal).
3. **Compra** los activos que pasan el filtro, asignando Stop Loss y Take Profit automáticos.
4. **Vigila** las posiciones abiertas y las cierra si se activa el SL o el TP.

### Registro de actividad (log)

Panel con el historial de acciones del bot en tiempo real:
- ✅ **BUY**: compra ejecutada — muestra símbolo, precio, RSI y score.
- ✅ **SELL**: venta ejecutada — muestra P&L de la operación.
- ℹ️ **HOLD**: activo analizado pero no comprado (no cumple criterios).
- ❌ **ERROR**: error en la ejecución.

### Detener el bot

Haz clic en **Detener Bot**. Las posiciones abiertas permanecen activas hasta que se cierren manualmente o el bot se reinicie.

---

## 9. Agente de Inversión IA

**Ruta**: `/ai`

El agente IA combina análisis algorítmico con inteligencia artificial conversacional (Claude de Anthropic).

### Estado del agente

- **Claude AI activo**: el sistema tiene una clave API de Anthropic configurada. El chat usa IA real.
- **Modo algorítmico**: no hay clave API. El chat usa respuestas basadas en el análisis técnico del screener.

> Para activar Claude AI: añade `ANTHROPIC_API_KEY=tu_clave` al archivo `/backend/.env` y reinicia el servidor.

### Pestaña "Recomendaciones"

Muestra las recomendaciones del motor algorítmico para tres horizontes:

**Corto plazo (1-15 días)**
- Criterios: RSI < 52, score ≥ 2, BB% < 0.55.
- Stop Loss: 4% bajo el precio de entrada.
- Take Profit: 8% sobre el precio de entrada.

**Medio plazo (1-3 meses)**
- Criterios: RSI < 62, score ≥ 3, BB% < 0.70.
- Stop Loss: 7% bajo la entrada.
- Take Profit: 18%.

**Largo plazo (6-24 meses)**
- Criterios: RSI < 68, score ≥ 4, BB% < 0.80.
- Stop Loss: 12%.
- Take Profit: 35%.

Cada tarjeta muestra:
- Símbolo, exchange, precio actual.
- Barra de confianza (%).
- Zona de entrada (precio mínimo y máximo sugerido).
- Stop Loss y Take Profit calculados.
- Ratio Riesgo:Recompensa.
- Razones técnicas que justifican la señal.
- Señal (COMPRA FUERTE / COMPRA / MANTENER).

### Pestaña "Chat con IA"

Chat conversacional donde puedes hacer preguntas en lenguaje natural sobre el mercado.

**Prompts rápidos** (botones de acceso directo):
- ¿Qué comprar hoy?
- Corto plazo (3 mejores oportunidades con niveles).
- Medio plazo.
- Largo plazo.
- ¿Qué evitar? (señales bajistas).
- Mi cartera (análisis y recomendaciones).

**Cómo usar el chat**:
1. Escribe tu pregunta en el campo de texto o usa un prompt rápido.
2. Pulsa Enter o el botón de enviar.
3. La IA responde con análisis basado en los datos reales del screener.
4. Puedes preguntar por activos concretos, estrategias, o pedir explicaciones de los indicadores.

**Ejemplos de preguntas útiles**:
- *"¿Cuál es el activo con mejor señal técnica ahora mismo?"*
- *"Analiza AAPL — ¿está en buen momento para comprar?"*
- *"¿Qué dice el RSI de BTC-USD?"*
- *"Dame un plan de inversión con 1.000€ para los próximos 3 meses"*

---

## 10. Simulador de Inversiones

**Ruta**: `/simulator`

### 10.1 Backtesting — ¿Qué habría pasado?

Simula una operación pasada con datos de mercado reales para evaluar si habría sido rentable.

**Cómo usarlo**:

1. Introduce el **símbolo** del activo (ej: AAPL, MSFT, BTC-USD).
2. Selecciona la **moneda** (USD o EUR).
3. Introduce la **fecha de compra** (la fecha en que habrías comprado).
4. Introduce la **fecha de venta** (o déjalo vacío para usar hoy).
5. Elige el **modo de cantidad**:
   - *Nº acciones*: cuántas acciones habrías comprado.
   - *Importe*: cuánto dinero habrías invertido en la moneda seleccionada.
6. Haz clic en **Simular operación**.

**Resultados que muestra**:

| Resultado | Explicación |
|-----------|-------------|
| **Calificación** | Excelente / Buena / Neutra / Pobre / Mala según el retorno |
| **P&L** | Ganancia o pérdida total |
| **Rentabilidad %** | Retorno porcentual bruto |
| **Rentab. anualizada** | Retorno ajustado a un año (para comparar períodos distintos) |
| **Días en cartera** | Duración del holding |
| **Alpha vs S&P 500** | Cuánto mejor/peor que el índice de referencia americano |
| **vs IBEX 35** | Comparativa con el índice español |

**Gráfico de rentabilidad**: evolución porcentual de tu activo vs S&P 500 vs IBEX 35 durante el período.

---

### 10.2 Proyecciones — Monte Carlo

Proyecta el valor futuro de una inversión usando 2.000 simulaciones estadísticas basadas en el historial real de volatilidad del activo.

**Cómo usarlo**:

1. Introduce el **símbolo** del activo.
2. Selecciona la **moneda**.
3. Introduce el **importe a invertir**.
4. Haz clic en **Proyectar (Monte Carlo)**.

**Resultados**:

- **Retorno histórico anual**: media del retorno anual de los últimos 2 años.
- **Volatilidad anual**: desviación estándar anualizada de los retornos.

**Tabla de proyecciones** para 7 horizontes (1 semana → 5 años):

| Columna | Significado |
|---------|-------------|
| **Pesimista (P25)** | El 25% de las simulaciones terminó por debajo de este valor |
| **Esperado (P50)** | La mediana — el 50% de las simulaciones está por encima y el 50% por debajo |
| **Optimista (P75)** | El 75% de las simulaciones terminó por debajo de este valor |
| **Prob. ganar** | % de simulaciones que terminaron en positivo |

**Gráfico de cono**: visualización del abanico de posibilidades a lo largo del tiempo.

> ⚠️ Las proyecciones son estimaciones estadísticas basadas en comportamiento histórico. No garantizan rendimientos futuros.

---

### 10.3 Calculadora Fiscal IRPF 2024

Calcula el impacto fiscal de tus operaciones según la legislación española vigente.

#### Paso 1 — Introduce tus compras

Para cada compra realizada:
1. Símbolo del activo.
2. Fecha de compra.
3. Precio por acción en el momento de la compra.
4. Cantidad de acciones compradas.
5. Moneda (EUR o USD). Si es USD, introduce el tipo de cambio EUR/USD en esa fecha.
6. Haz clic en **Añadir compra**.

Repite para cada lote de compra (incluso del mismo activo si compraste en fechas distintas).

#### Paso 2 — Introduce tus ventas

Para cada venta del ejercicio fiscal:
1. Símbolo del activo vendido.
2. Fecha de venta.
3. Precio de venta por acción.
4. Cantidad vendida.
5. Moneda y tipo de cambio si es USD.
6. Haz clic en **Añadir venta**.

#### Paso 3 — Resultado fiscal

La calculadora aplica automáticamente:

**Método FIFO (obligatorio por ley)**
Las acciones vendidas se descuentan del lote más antiguo primero. Si compraste 10 acciones en enero y 10 en junio, al vender 10 en diciembre se considera que has vendido las de enero.

**Tramos IRPF 2024 — Base del ahorro**:

| Tramo | Tipo |
|-------|------|
| Hasta 6.000 € | 19% |
| De 6.000 € a 50.000 € | 21% |
| De 50.000 € a 200.000 € | 23% |
| De 200.000 € a 300.000 € | 27% |
| Más de 300.000 € | 28% |

**Compensación de pérdidas**:
- Las pérdidas del ejercicio reducen las ganancias antes de calcular el impuesto.
- Puedes introducir pérdidas de ejercicios anteriores (hasta 4 años) en el campo "Pérdidas pendientes de ejercicios anteriores".

**Regla de los 2 meses (Art. 33.5 LIRPF)**:
Si vendes con pérdidas y recompras el mismo activo en los 2 meses siguientes (o los 2 meses anteriores), la pérdida queda diferida. La calculadora muestra una advertencia cuando detecta esta situación.

**Modelo 720**:
Si tienes más de 50.000 € en activos financieros en el extranjero, tienes obligación de declararlo.

---

## 11. Watchlist y navegación lateral

### Añadir un activo a la Watchlist

Desde cualquier tabla de activos (Dashboard, Screener), haz clic en la estrella **★** del activo.

Desde el gráfico, haz clic en el botón de estrella en la cabecera.

### Ver un activo de la Watchlist

Haz clic en el símbolo o en la fila del activo en el panel lateral. Se abre el gráfico.

### Eliminar de la Watchlist

Haz clic en la **×** junto al símbolo en el panel lateral.

### Precios en la Watchlist

Los precios se actualizan automáticamente cada **15 segundos**. Se muestran el precio actual y la variación porcentual del día.

### Estado de los mercados

En la parte inferior del sidebar se muestra si cada mercado está abierto ahora mismo:

- **NYSE / NASDAQ**: 09:30 – 16:00 hora de Nueva York.
- **Bolsa de Madrid**: 09:00 – 17:30 hora de Madrid.
- **Crypto 24/7**: siempre abierto.

---

## 12. Guía del Inversor (asistente flotante)

El botón azul **"Guía"** en la esquina inferior derecha abre un panel lateral con ayuda contextual.

### Consejos de página
Al abrir la guía, muestra 2-3 consejos específicos para la página en la que estás en ese momento.

### ¿Qué quieres hacer?
Acceso directo a las guías más comunes:
- **Comprar un activo** (5 pasos con navegación integrada).
- **Vender / cerrar posición** (4 pasos).
- **Buscar activos para invertir**.
- **Gestionar mi riesgo**.

### Guías completas
7 guías expandibles con pasos detallados:
1. Entender el Dashboard.
2. Leer los Indicadores Técnicos (RSI, MACD, Bollinger, Score).
3. Cómo Comprar un Activo (5 pasos).
4. Cuándo y Cómo Vender.
5. Usar el Screener.
6. Gestión del Riesgo.
7. Usar el Simulador.

### Navegación rápida
Botones para ir directamente a cualquier sección sin cerrar la guía.

---

## 13. Fuentes de datos y fiabilidad

Los datos de mercado se obtienen de varias fuentes con un sistema de fallback automático:

| Prioridad | Fuente | API Key | Cobertura |
|-----------|--------|---------|-----------|
| 1 | **Yahoo Finance** | No | Acciones globales, ETFs, crypto, forex |
| 2 | **Stooq** | No | Acciones US/EU, índices, forex, crypto |
| 3 | **CoinGecko** | No | Criptomonedas |
| 4 | **FMP** | Sí (opcional) | Acciones, ETFs, forex |
| 5 | **Alpha Vantage** | Sí (opcional) | Acciones US |
| 6 | **Datos simulados** | — | Fallback cuando todo falla |

Cuando los datos son simulados, el gráfico muestra un banner **"Modo demo"**. Las cotizaciones en tiempo real pueden mostrar la etiqueta de la fuente usada.

**Actualización de datos**:
- Cotizaciones en tiempo real: cada 15 segundos.
- Datos históricos (gráficos): caché de 4 horas.
- Watchlist: cada 15 segundos.
- Estado del bot: cada 3 segundos.

---

## 14. Glosario rápido

| Término | Definición |
|---------|-----------|
| **RSI** | Relative Strength Index. Mide la velocidad y cambio de los movimientos de precio. <30 = sobrevendido. >70 = sobrecomprado. |
| **MACD** | Moving Average Convergence Divergence. Diferencia entre dos medias móviles exponenciales. Histograma positivo = impulso alcista. |
| **Bollinger Bands** | Bandas a ±2 desviaciones estándar de la media móvil. BB% = 0 es la banda inferior, BB% = 1 es la banda superior. |
| **Score** | Puntuación algoritmica 0-10 que combina RSI, MACD y Bollinger. >6 = señal positiva. |
| **P&L** | Profit & Loss. Ganancia o pérdida de una posición o del portfolio total. |
| **Stop Loss** | Orden de venta automática que se activa si el precio baja a un nivel definido. Limita las pérdidas. |
| **Take Profit** | Orden de venta automática que se activa si el precio sube al objetivo. Asegura ganancias. |
| **Paper Trading** | Simulación de operaciones con dinero virtual. Sin riesgo real. |
| **Backtesting** | Probar una estrategia de inversión usando datos históricos para ver qué habría pasado. |
| **FIFO** | First In, First Out. Método de valoración de activos que vende primero las acciones compradas primero. Obligatorio en España. |
| **Alpha** | Rentabilidad superior (o inferior) respecto a un índice de referencia en el mismo período. |
| **Volatilidad** | Medida de la variación del precio a lo largo del tiempo. Alta volatilidad = más riesgo y más potencial de ganancia. |
| **Monte Carlo** | Método estadístico que corre miles de simulaciones aleatorias para estimar la distribución de posibles resultados futuros. |
| **IRPF** | Impuesto sobre la Renta de las Personas Físicas. En España, las ganancias del capital tributan en la base del ahorro al 19-28%. |
| **Win Rate** | Porcentaje de operaciones que terminaron con ganancia respecto al total cerrado. |
| **R:R** | Ratio Riesgo:Recompensa. Compara la ganancia potencial (TP) con la pérdida máxima (SL). R:R 1:3 significa que por cada euro en riesgo puedes ganar 3. |
| **Spread** | Diferencia entre el precio de compra (ask) y el precio de venta (bid). |
| **Liquidez / Volumen** | El volumen indica cuántas unidades se han negociado. Alto volumen = alta liquidez = más fácil entrar y salir. |

---

*Manual generado automáticamente — Bolsa Terminal v1.0 — Abril 2026*
*Todos los datos y simulaciones son educativos y no constituyen asesoramiento financiero.*
