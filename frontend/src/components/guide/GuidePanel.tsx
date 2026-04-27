import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  X, BookOpen, TrendingUp, ShoppingCart, BarChart2, Search,
  FlaskConical, ChevronRight, ChevronDown, AlertTriangle,
  CheckCircle2, CircleDot, ArrowRight,
} from 'lucide-react';

// ── Content definitions ───────────────────────────────────────────────────────

interface Step { title: string; text: string; action?: { label: string; path: string } }
interface Section { id: string; icon: React.ElementType; title: string; steps: Step[] }

const SECTIONS: Section[] = [
  {
    id: 'dashboard', icon: BarChart2, title: 'Entender el Dashboard',
    steps: [
      {
        title: '¿Qué son los índices globales?',
        text: 'Los índices (S&P 500, IBEX 35, Nasdaq…) miden el rendimiento de un grupo de acciones. Si el S&P 500 sube, significa que las 500 mayores empresas de EE.UU. en promedio valen más. Son el "termómetro" del mercado.',
      },
      {
        title: '¿Qué significa el color verde/rojo?',
        text: 'Verde = sube respecto al cierre anterior. Rojo = baja. El porcentaje indica cuánto ha variado hoy. Un +1% en el S&P 500 es un día muy bueno; un -3% es una caída importante.',
      },
      {
        title: 'Tabla de activos — columnas',
        text: '• Precio: último precio negociado.\n• Cambio %: variación del día.\n• Volumen: número de acciones compradas/vendidas hoy. Alto volumen = más convicción en el movimiento.\n• RSI: indicador de sobrecompra/sobreventa (ver sección indicadores).\n• Score: puntuación algorítmica 0-10 de nuestra IA. >6 = señal positiva.',
      },
      {
        title: '¿Mis Productos vs Portfolio?',
        text: 'Mis Productos muestra un resumen de tus posiciones actuales (broker paper + portfolio manual). Portfolio es donde gestionas tus activos manualmente. El broker es para simular operaciones.',
        action: { label: 'Ir a Mis Productos', path: '/' },
      },
    ],
  },
  {
    id: 'indicators', icon: TrendingUp, title: 'Leer los Indicadores Técnicos',
    steps: [
      {
        title: 'RSI — Índice de Fuerza Relativa',
        text: '• Rango: 0–100.\n• < 30: el activo está sobrevendido → posible rebote alcista.\n• > 70: sobrecomprado → posible corrección bajista.\n• 30–70: zona neutral.\n⚠️ El RSI solo es válido en contexto. Un RSI de 25 en tendencia bajista puede seguir bajando.',
      },
      {
        title: 'MACD — Convergencia/Divergencia',
        text: '• Histograma positivo (verde) = impulso alcista.\n• Histograma negativo (rojo) = impulso bajista.\n• Cruce de la línea MACD sobre la señal = señal de compra.\n• Cruce hacia abajo = señal de venta.\nEs mejor en tendencia que en rangos laterales.',
      },
      {
        title: 'Bandas de Bollinger (BB%)',
        text: '• BB% = 0: precio en la banda inferior (posible soporte).\n• BB% = 1: precio en la banda superior (posible resistencia).\n• BB% = 0.5: precio en la media móvil.\nCuando el precio toca la banda inferior con RSI bajo, es una zona de posible entrada.',
      },
      {
        title: 'Score combinado (0–10)',
        text: 'Nuestra IA combina RSI + MACD + Bollinger en una puntuación:\n• 0–3: señal bajista fuerte.\n• 4–5: neutral.\n• 6–7: señal alcista moderada.\n• 8–10: señal alcista fuerte.\nNunca uses el score solo — confirma con el gráfico.',
      },
    ],
  },
  {
    id: 'buy', icon: ShoppingCart, title: 'Cómo Comprar un Activo',
    steps: [
      {
        title: 'Paso 1 — Elige el activo',
        text: 'Usa el Screener para filtrar activos por señal, RSI, sector y score. Busca activos con RSI < 40, score > 6 y volumen por encima de la media. Esto indica presión compradora con margen de subida.',
        action: { label: 'Abrir Screener', path: '/screener' },
      },
      {
        title: 'Paso 2 — Analiza el gráfico',
        text: 'Entra en el gráfico del activo (clic en el símbolo). Busca:\n• Tendencia alcista (máximos y mínimos crecientes).\n• Soporte cercano donde colocar el Stop Loss.\n• Zona de entrada: cerca de la media móvil o banda inferior de Bollinger.',
      },
      {
        title: 'Paso 3 — Define tu riesgo',
        text: 'Antes de comprar decide:\n• Importe a invertir (nunca más del 5–10% de tu capital en un solo activo).\n• Stop Loss: precio al que saldrás si la operación va mal (ej: -5%).\n• Take Profit: precio objetivo de ganancia (ej: +15%).\nRatio mínimo recomendado: 1:2 (arriesgando 1 para ganar 2).',
      },
      {
        title: 'Paso 4 — Ejecuta la orden',
        text: 'En el Broker, escribe el símbolo, selecciona COMPRAR, introduce la cantidad o importe, y establece Stop Loss y Take Profit. Pulsa "Comprar". La orden se ejecuta al precio de mercado actual.',
        action: { label: 'Ir al Broker', path: '/broker' },
      },
      {
        title: 'Paso 5 — Prueba primero con el Simulador',
        text: 'Antes de operar con dinero real, usa el Simulador de Backtesting para ver qué habría pasado si hubieras comprado ese activo en el pasado. También puedes proyectar con Monte Carlo.',
        action: { label: 'Abrir Simulador', path: '/simulator' },
      },
    ],
  },
  {
    id: 'sell', icon: ArrowRight, title: 'Cuándo y Cómo Vender',
    steps: [
      {
        title: 'Vender por Take Profit',
        text: 'Si el precio alcanza tu objetivo de ganancia (+15%, +20%…), vende. No seas codicioso esperando más — asegura el beneficio. Puedes vender en parciales: 50% al alcanzar el TP1 y dejar el resto correr.',
      },
      {
        title: 'Vender por Stop Loss',
        text: 'Si el precio cae a tu nivel de stop (-5%, -7%…), VENDE SIN DUDARLO. El stop loss existe para protegerte. Muchos inversores novatos no respetan el stop y convierten pérdidas pequeñas en grandes.',
      },
      {
        title: 'Señales técnicas de salida',
        text: '• RSI > 75 con histograma MACD cayendo: señal de agotamiento alcista.\n• Precio en la banda superior de Bollinger con divergencia bajista.\n• Cruce bajista del MACD (histograma pasa de positivo a negativo).\n• Rotura de soporte clave.',
      },
      {
        title: 'Vender en el Broker',
        text: 'En la tabla "Posiciones abiertas", pulsa el botón "Vender" del activo. O en el panel de trading, selecciona VENDER, escribe el símbolo y la cantidad.',
        action: { label: 'Ir al Broker', path: '/broker' },
      },
    ],
  },
  {
    id: 'screener', icon: Search, title: 'Usar el Screener',
    steps: [
      {
        title: '¿Qué es el Screener?',
        text: 'El Screener filtra todos los activos monitorizados según criterios técnicos. Te permite encontrar rápidamente los activos con mejores señales en cada momento, sin tener que revisar uno por uno.',
        action: { label: 'Abrir Screener', path: '/screener' },
      },
      {
        title: 'Filtros disponibles',
        text: '• Bolsa: filtra por NYSE, NASDAQ, BME (Madrid), Crypto.\n• Señal: BUY/SELL/NEUTRAL según el análisis técnico.\n• RSI: filtra por rango (sobrevendido < 30, sobrecomprado > 70).\n• Sector: tecnología, banca, energía, etc.',
      },
      {
        title: 'Cómo usar los resultados',
        text: '1. Filtra por Señal = BUY y RSI < 45.\n2. Ordena por Score (mayor primero).\n3. Abre el gráfico de los top 3 resultados.\n4. Confirma la tendencia visual en el gráfico.\n5. Si todo coincide, considera entrar.',
      },
    ],
  },
  {
    id: 'risk', icon: AlertTriangle, title: 'Gestión del Riesgo',
    steps: [
      {
        title: 'Regla del 1–2%',
        text: 'Nunca arriesgues más del 1–2% de tu capital total en una sola operación. Si tienes 10.000€, el máximo que puedes perder en una operación es 100–200€. Esto te permite sobrevivir muchas operaciones perdedoras consecutivas.',
      },
      {
        title: 'Diversificación',
        text: 'No pongas todo en un solo activo o sector. Una cartera equilibrada puede tener:\n• 40–60% acciones (varios sectores).\n• 20–30% ETFs de índices.\n• 10–20% bonos o activos defensivos.\n• 5–10% crypto (si tienes tolerancia al riesgo).',
      },
      {
        title: 'Stop Loss siempre',
        text: 'El Stop Loss NO es opcional. Es tu seguro contra errores. Colócalo siempre al abrir una posición. Un activo puede caer un 50% o más en horas (noticias, crisis). Sin stop, puedes perder todo tu capital en una posición.',
      },
      {
        title: 'La calculadora fiscal',
        text: 'Recuerda que las ganancias tributan en España (IRPF 19–28%). Usa la Calculadora Fiscal del Simulador para calcular cuánto pagarás antes de cerrar una operación. A veces es mejor esperar a tener la posición más de un año para optimizar el tipo.',
        action: { label: 'Calculadora Fiscal', path: '/simulator' },
      },
    ],
  },
  {
    id: 'simulator', icon: FlaskConical, title: 'Usar el Simulador',
    steps: [
      {
        title: 'Backtesting — qué habría pasado',
        text: 'Introduce un símbolo, una fecha de compra y una fecha de venta (o hoy). El simulador te muestra exactamente qué rentabilidad habrías obtenido, cómo te habrías comparado con el S&P 500, y si la operación habría sido buena o mala.',
        action: { label: 'Abrir Backtesting', path: '/simulator' },
      },
      {
        title: 'Proyecciones Monte Carlo',
        text: 'Introduce un símbolo y un importe. El sistema corre 2.000 simulaciones usando el historial de volatilidad real del activo para proyectar posibles valores futuros. Los percentiles P25/P50/P75 te dan escenarios pesimista, esperado y optimista.',
      },
      {
        title: 'Calculadora Fiscal IRPF 2024',
        text: 'Introduce tus compras y ventas del año. La calculadora aplica:\n• FIFO (obligatorio por ley en España).\n• Tramos del ahorro: 19%/21%/23%/27%/28%.\n• Regla de los 2 meses (Art. 33.5 LIRPF).\n• Compensación de pérdidas de años anteriores.',
      },
    ],
  },
];

// ── Page-aware quick tips ─────────────────────────────────────────────────────
const PAGE_TIPS: Record<string, { tip: string; sectionId: string }[]> = {
  '/': [
    { tip: 'Los índices en rojo hoy no significa que debas vender — revisa la tendencia semanal.', sectionId: 'dashboard' },
    { tip: 'Un score > 7 en la tabla indica una señal técnica fuerte. Confirma en el gráfico.', sectionId: 'indicators' },
  ],
  '/screener': [
    { tip: 'Filtra por Señal=BUY y RSI<40 para encontrar activos sobrevendidos con señal alcista.', sectionId: 'screener' },
    { tip: 'El volumen alto junto a un precio en subida confirma la tendencia.', sectionId: 'indicators' },
  ],
  '/broker': [
    { tip: 'Establece siempre Stop Loss antes de comprar. Sin él, una mala operación puede ser catastrófica.', sectionId: 'risk' },
    { tip: 'Usa el modo "Importe €/$ " para controlar exactamente cuánto dinero inviertes.', sectionId: 'buy' },
  ],
  '/simulator': [
    { tip: 'Empieza haciendo backtest de operaciones que habrías querido hacer — aprende de los datos reales.', sectionId: 'simulator' },
    { tip: 'En proyecciones, fíjate en la "Prob. ganar" — si es < 50%, el activo históricamente baja más de lo que sube.', sectionId: 'simulator' },
  ],
  '/ai': [
    { tip: 'El agente IA tiene acceso a los datos del screener en tiempo real — pregúntale qué comprar hoy.', sectionId: 'buy' },
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────
interface Props { onClose: () => void }

export function GuidePanel({ onClose }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openStep,    setOpenStep]    = useState<number | null>(null);
  const [view, setView] = useState<'home' | 'section'>('home');
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  const pageTips = PAGE_TIPS[location.pathname] ?? PAGE_TIPS['/'];

  function openSec(sec: Section) {
    setActiveSection(sec);
    setOpenStep(null);
    setView('section');
  }

  function goHome() { setView('home'); setActiveSection(null); setOpenStep(null); }

  function nav(path: string) { navigate(path); onClose(); }

  return (
    <div className="guide-panel">
      {/* Header */}
      <div className="guide-header">
        <div className="guide-header-left">
          {view === 'section' && (
            <button className="guide-back-btn" onClick={goHome}>← Inicio</button>
          )}
          <div className="guide-header-title">
            <BookOpen size={14} />
            {view === 'home' ? 'Guía del Inversor' : activeSection?.title}
          </div>
        </div>
        <button className="guide-close-btn" onClick={onClose}><X size={14} /></button>
      </div>

      <div className="guide-body">
        {/* ── HOME VIEW ── */}
        {view === 'home' && (
          <>
            {/* Page-specific tips */}
            {pageTips.length > 0 && (
              <div className="guide-tips-box">
                <div className="guide-tips-title">💡 Consejos para esta página</div>
                {pageTips.map((t, i) => (
                  <div key={i} className="guide-tip-row">
                    <CircleDot size={9} style={{ flexShrink: 0, marginTop: 3, color: '#3b82f6' }} />
                    <span>{t.tip} <button className="guide-link-btn" onClick={() => openSec(SECTIONS.find(s => s.id === t.sectionId)!)}>
                      Ver guía →
                    </button></span>
                  </div>
                ))}
              </div>
            )}

            {/* Process wizard */}
            <div className="guide-wizard">
              <div className="guide-section-title">¿Qué quieres hacer?</div>
              <div className="guide-wizard-btns">
                <button className="guide-wizard-btn" onClick={() => openSec(SECTIONS.find(s => s.id === 'buy')!)}>
                  <ShoppingCart size={14} /> Comprar un activo
                </button>
                <button className="guide-wizard-btn" onClick={() => openSec(SECTIONS.find(s => s.id === 'sell')!)}>
                  <ArrowRight size={14} /> Vender / cerrar posición
                </button>
                <button className="guide-wizard-btn" onClick={() => openSec(SECTIONS.find(s => s.id === 'screener')!)}>
                  <Search size={14} /> Buscar activos para invertir
                </button>
                <button className="guide-wizard-btn" onClick={() => openSec(SECTIONS.find(s => s.id === 'risk')!)}>
                  <AlertTriangle size={14} /> Gestionar mi riesgo
                </button>
              </div>
            </div>

            {/* All guides */}
            <div className="guide-section-title" style={{ marginTop: 16 }}>Guías completas</div>
            <div className="guide-sections-list">
              {SECTIONS.map(sec => (
                <button key={sec.id} className="guide-section-row" onClick={() => openSec(sec)}>
                  <sec.icon size={13} style={{ flexShrink: 0, color: '#3b82f6' }} />
                  <span>{sec.title}</span>
                  <span style={{ fontSize: 10, color: '#475569' }}>{sec.steps.length} pasos</span>
                  <ChevronRight size={11} style={{ marginLeft: 'auto', color: '#475569' }} />
                </button>
              ))}
            </div>

            {/* Quick nav */}
            <div className="guide-section-title" style={{ marginTop: 16 }}>Navegación rápida</div>
            <div className="guide-quick-nav">
              {[
                { label: 'Dashboard',  path: '/'           },
                { label: 'Screener',   path: '/screener'   },
                { label: 'Gráfico',    path: '/chart/AAPL' },
                { label: 'Broker',     path: '/broker'     },
                { label: 'Simulador',  path: '/simulator'  },
                { label: 'Agente IA',  path: '/ai'         },
              ].map(({ label, path }) => (
                <button key={path} className="guide-nav-chip" onClick={() => nav(path)}>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── SECTION VIEW ── */}
        {view === 'section' && activeSection && (
          <div className="guide-steps">
            {activeSection.steps.map((step, i) => (
              <div key={i} className="guide-step">
                <button
                  className={`guide-step-header${openStep === i ? ' open' : ''}`}
                  onClick={() => setOpenStep(openStep === i ? null : i)}
                >
                  <div className="guide-step-num">
                    {openStep === i ? <CheckCircle2 size={14} color="#22c55e" /> : <span>{i + 1}</span>}
                  </div>
                  <span className="guide-step-title">{step.title}</span>
                  <ChevronDown size={11} className={`guide-chevron${openStep === i ? ' open' : ''}`} />
                </button>

                {openStep === i && (
                  <div className="guide-step-body">
                    {step.text.split('\n').map((line, li) => (
                      <p key={li} style={{ margin: '3px 0', color: line.startsWith('•') ? '#94a3b8' : '#e2e8f0' }}>
                        {line}
                      </p>
                    ))}
                    {step.action && (
                      <button
                        className="guide-action-btn"
                        onClick={() => nav(step.action!.path)}
                      >
                        {step.action.label} <ChevronRight size={11} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
