import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, ChevronRight, BarChart2, Search, Bot, Landmark, BookOpen, TrendingUp } from 'lucide-react';

interface Step {
  id: number;
  icon: React.ElementType;
  title: string;
  desc: string;
  detail: string;
  action: string;
  path?: string;
  color: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    icon: BookOpen,
    title: 'Entiende los mercados',
    desc: 'Aprende los conceptos básicos antes de invertir',
    detail: 'Estudia qué son las acciones, bonos y ETFs. Entiende cómo se forma el precio y qué indicadores técnicos te dicen sobre un activo. Nunca inviertas en lo que no entiendes.',
    action: 'Ver guía de mercados',
    color: '#3b82f6',
    path: undefined,
  },
  {
    id: 2,
    icon: Search,
    title: 'Analiza con el Screener',
    desc: 'Filtra activos por señales técnicas y fundamentales',
    detail: 'El screener analiza todos los activos con RSI, MACD y Bollinger Bands. Filtra por mercado, sector y señal. Ordena por score para encontrar las mejores oportunidades.',
    action: 'Abrir Screener',
    color: '#8b5cf6',
    path: '/screener',
  },
  {
    id: 3,
    icon: BarChart2,
    title: 'Estudia el gráfico',
    desc: 'Analiza la historia del precio y las señales',
    detail: 'Busca cualquier activo y abre su gráfico. Activa los indicadores (RSI, MACD, Bandas de Bollinger) para ver el estado técnico. La recomendación automática te da un score de -9 a +9.',
    action: 'Ver gráfico AAPL',
    color: '#06b6d4',
    path: '/chart/AAPL',
  },
  {
    id: 4,
    icon: Bot,
    title: 'Consulta al agente IA',
    desc: 'Obtén recomendaciones para corto, medio y largo plazo',
    detail: 'El agente IA analiza todos los datos del mercado en tiempo real y te da recomendaciones personalizadas con niveles de entrada, stop-loss y take-profit para cada horizonte temporal.',
    action: 'Preguntar al agente',
    color: '#22c55e',
    path: '/ai',
  },
  {
    id: 5,
    icon: Landmark,
    title: 'Practica en el Broker',
    desc: 'Opera con $100.000 de capital virtual sin riesgo',
    detail: 'Usa el paper trading para practicar antes de arriesgar dinero real. Compra y vende con precios reales de mercado. Aprende a gestionar posiciones, stop-loss y take-profit.',
    action: 'Ir al Broker',
    color: '#f59e0b',
    path: '/broker',
  },
  {
    id: 6,
    icon: TrendingUp,
    title: 'Invierte de verdad',
    desc: 'Cuando tengas confianza, pasa a dinero real',
    detail: 'Solo da el paso al dinero real cuando hayas demostrado consistencia en el paper trading. Elige un broker regulado, empieza con cantidades pequeñas y nunca inviertas dinero que no puedas permitirte perder.',
    action: 'Elegir un broker real',
    color: '#ef4444',
    path: undefined,
  },
];

export function InvestmentGuide() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(null);

  function toggle(id: number) {
    setExpanded((prev) => prev === id ? null : id);
  }

  function markDone(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const progress = Math.round((completed.size / STEPS.length) * 100);

  return (
    <div className="inv-guide">
      <div className="inv-guide-header">
        <div>
          <div className="inv-guide-title">Guía paso a paso: cómo invertir</div>
          <div className="inv-guide-subtitle">Sigue estos pasos para invertir con criterio y seguridad</div>
        </div>
        <div className="inv-guide-progress-wrap">
          <div className="inv-guide-progress-label">{completed.size}/{STEPS.length} completados</div>
          <div className="inv-guide-progress-track">
            <div className="inv-guide-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="inv-guide-steps">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const done = completed.has(step.id);
          const open = expanded === step.id;

          return (
            <div
              key={step.id}
              className={`inv-step ${done ? 'inv-step-done' : ''} ${open ? 'inv-step-open' : ''}`}
              onClick={() => toggle(step.id)}
            >
              <div className="inv-step-row">
                {/* Number + icon */}
                <div className="inv-step-icon-wrap" style={{ borderColor: done ? '#22c55e' : step.color + '66', background: done ? 'rgba(34,197,94,0.1)' : step.color + '18' }}>
                  {done
                    ? <CheckCircle size={16} style={{ color: '#22c55e' }} />
                    : <Icon size={16} style={{ color: step.color }} />
                  }
                </div>

                {/* Text */}
                <div className="inv-step-text">
                  <div className="inv-step-num">Paso {step.id}</div>
                  <div className="inv-step-title">{step.title}</div>
                  <div className="inv-step-desc">{step.desc}</div>
                </div>

                {/* Right */}
                <div className="inv-step-right">
                  <button
                    className={`inv-step-check ${done ? 'checked' : ''}`}
                    onClick={(e) => markDone(step.id, e)}
                    title={done ? 'Marcar como pendiente' : 'Marcar como completado'}
                  >
                    {done ? <CheckCircle size={14} /> : <Circle size={14} />}
                  </button>
                  <ChevronRight size={14} className={`inv-step-chevron ${open ? 'open' : ''}`} />
                </div>
              </div>

              {/* Expanded detail */}
              {open && (
                <div className="inv-step-detail">
                  <p className="inv-step-detail-text">{step.detail}</p>
                  {step.path ? (
                    <button
                      className="inv-step-action"
                      style={{ borderColor: step.color + '66', color: step.color, background: step.color + '18' }}
                      onClick={(e) => { e.stopPropagation(); navigate(step.path!); }}
                    >
                      {step.action} →
                    </button>
                  ) : step.id === 1 ? (
                    <a
                      href="docs/guia-mercados-financieros.md"
                      target="_blank"
                      className="inv-step-action"
                      style={{ borderColor: step.color + '66', color: step.color, background: step.color + '18' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {step.action} →
                    </a>
                  ) : (
                    <span className="inv-step-action-text" style={{ color: step.color }}>
                      Busca un broker regulado (DeGiro, IBKR, XTB) y abre una cuenta real cuando te sientas preparado.
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
