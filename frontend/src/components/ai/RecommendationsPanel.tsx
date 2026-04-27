import { useNavigate } from 'react-router-dom';
import { AiRecommendations, InvestmentRecommendation } from '../../types';
import { SignalBadge } from '../ui/Badge';
import { TrendingUp, TrendingDown, Clock, Target, Shield } from 'lucide-react';

const TF_CONFIG = {
  short:  { label: 'Corto Plazo',  sublabel: '1-15 días',  color: '#f59e0b', icon: '⚡' },
  medium: { label: 'Medio Plazo',  sublabel: '1-3 meses',  color: '#3b82f6', icon: '📈' },
  long:   { label: 'Largo Plazo',  sublabel: '6-24 meses', color: '#22c55e', icon: '🏔️' },
};

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 70 ? '#22c55e' : value >= 45 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ flex: 1, height: 4, background: '#1a2235', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 10, color, fontFamily: 'JetBrains Mono, monospace', minWidth: 28 }}>{value}%</span>
    </div>
  );
}

function RecCard({ rec, onClick }: { rec: InvestmentRecommendation; onClick: () => void }) {
  const isPos = rec.changePercent >= 0;
  const rrColor = rec.riskReward >= 2 ? '#22c55e' : rec.riskReward >= 1.5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="rec-invest-card" onClick={onClick}>
      <div className="rec-invest-top">
        <div>
          <div className="rec-invest-symbol">{rec.symbol}</div>
          <div className="rec-invest-exchange">{rec.exchange} · {rec.shortName}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="rec-invest-price">${rec.price.toFixed(2)}</div>
          <div className={`rec-invest-change ${isPos ? 'pos' : 'neg'}`}>
            {isPos ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
            {isPos ? '+' : ''}{rec.changePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div style={{ margin: '6px 0' }}>
        <ConfidenceBar value={rec.confidence} />
      </div>

      <div className="rec-invest-levels">
        <div className="rec-level">
          <Target size={9} /><span>Entrada</span>
          <strong>${rec.entryZone[0].toFixed(2)}</strong>
        </div>
        <div className="rec-level" style={{ color: '#ef4444' }}>
          <Shield size={9} /><span>SL</span>
          <strong>${rec.stopLoss.toFixed(2)}</strong>
        </div>
        <div className="rec-level" style={{ color: '#22c55e' }}>
          <TrendingUp size={9} /><span>TP</span>
          <strong>${rec.takeProfit.toFixed(2)}</strong>
        </div>
        <div className="rec-level" style={{ color: rrColor }}>
          <span>R:R</span>
          <strong>1:{rec.riskReward}</strong>
        </div>
      </div>

      <div className="rec-invest-tags">
        <span className="rec-invest-tag" style={{ color: '#94a3b8' }}>
          RSI {rec.rsi.toFixed(1)}
        </span>
        <span className="rec-invest-tag" style={{ color: rec.score >= 3 ? '#22c55e' : '#f59e0b' }}>
          Score {rec.score > 0 ? '+' : ''}{rec.score}
        </span>
        <SignalBadge signal={rec.signal as any} />
      </div>

      <div className="rec-invest-reason">{rec.reasons[0]}</div>
    </div>
  );
}

interface Props {
  recommendations: AiRecommendations;
  compact?: boolean;
}

export function RecommendationsPanel({ recommendations, compact }: Props) {
  const navigate = useNavigate();

  return (
    <div className="recs-panel">
      {(Object.entries(TF_CONFIG) as [keyof AiRecommendations, typeof TF_CONFIG['short']][]).map(([tf, cfg]) => {
        const recs = recommendations[tf];
        return (
          <div key={tf} className="recs-tf-section">
            <div className="recs-tf-header" style={{ borderLeftColor: cfg.color }}>
              <div>
                <span className="recs-tf-icon">{cfg.icon}</span>
                <span className="recs-tf-label" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="recs-tf-sublabel">
                  <Clock size={9} /> {cfg.sublabel}
                </span>
              </div>
              <span className="recs-tf-strategy">{recs[0]?.strategy ?? '—'}</span>
            </div>

            {recs.length === 0 ? (
              <div className="recs-empty">Sin señales que cumplan criterios ahora mismo</div>
            ) : (
              <div className={`recs-grid ${compact ? 'recs-grid-compact' : ''}`}>
                {recs.map((rec) => (
                  <RecCard
                    key={rec.symbol}
                    rec={rec}
                    onClick={() => navigate(`/chart/${encodeURIComponent(rec.symbol)}`)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
