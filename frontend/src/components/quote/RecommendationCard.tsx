import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { Recommendation } from '../../types';
import { SignalBadge, ScoreBar } from '../ui/Badge';

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const sigCls = {
    STRONG_BUY: 'rec-signal-box rec-signal-strong-buy',
    BUY: 'rec-signal-box rec-signal-buy',
    NEUTRAL: 'rec-signal-box rec-signal-neutral',
    SELL: 'rec-signal-box rec-signal-sell',
    STRONG_SELL: 'rec-signal-box rec-signal-strong-sell',
  }[rec.signal] ?? 'rec-signal-box rec-signal-neutral';

  const Icon = rec.signal.includes('BUY') ? TrendingUp : rec.signal.includes('SELL') ? TrendingDown : Minus;

  const metricColor = (v: number, high: number, low: number) =>
    v > high ? '#ef4444' : v < low ? '#22c55e' : '#e2e8f0';

  return (
    <div className="rec-card">
      <div className="rec-card-title">
        <h3>Señal de Inversión</h3>
        <AlertTriangle size={11} style={{ color: '#eab308' }} />
      </div>

      <div className={sigCls}>
        <Icon size={22} />
        <div>
          <SignalBadge signal={rec.signal} />
          <div style={{ fontSize: 10, color: 'inherit', opacity: 0.6, marginTop: 3 }}>
            Puntuación: {rec.score > 0 ? '+' : ''}{rec.score} / 9
          </div>
        </div>
      </div>

      <ScoreBar score={rec.score} />

      {/* Key metrics */}
      <div className="rec-metrics" style={{ marginTop: 10 }}>
        <div className="rec-metric">
          <div className="rec-metric-label">RSI</div>
          <div className="rec-metric-value" style={{ color: metricColor(rec.currentRSI, 70, 30) }}>
            {isNaN(rec.currentRSI) ? '—' : rec.currentRSI.toFixed(1)}
          </div>
        </div>
        <div className="rec-metric">
          <div className="rec-metric-label">MACD</div>
          <div className="rec-metric-value" style={{ color: rec.currentMACD >= 0 ? '#22c55e' : '#ef4444', fontSize: 11 }}>
            {isNaN(rec.currentMACD) ? '—' : (rec.currentMACD > 0 ? '+' : '') + rec.currentMACD.toFixed(3)}
          </div>
        </div>
        <div className="rec-metric">
          <div className="rec-metric-label">BB %</div>
          <div className="rec-metric-value" style={{ color: metricColor(rec.currentBBPercent * 100, 75, 25) }}>
            {isNaN(rec.currentBBPercent) ? '—' : (rec.currentBBPercent * 100).toFixed(0) + '%'}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ marginTop: 10 }}>
        <div className="rec-breakdown-title">Desglose de señales</div>
        {rec.components.map((c) => (
          <div key={c.name} className="rec-component">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="rec-component-name">{c.name}</div>
              <div className="rec-component-signal">{c.signal}</div>
            </div>
            <div
              className="rec-component-score"
              style={{ color: c.score > 0 ? '#22c55e' : c.score < 0 ? '#ef4444' : '#475569' }}
            >
              {c.score > 0 ? '+' : ''}{c.score}
            </div>
          </div>
        ))}
      </div>

      <p className="rec-disclaimer">
        ⚠ Sólo análisis técnico. No es asesoramiento financiero. Toda inversión conlleva riesgo de pérdida.
      </p>
    </div>
  );
}
