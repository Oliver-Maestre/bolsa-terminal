import { SignalType } from '../../types';

const BADGE_CONFIG: Record<SignalType, { label: string; cls: string }> = {
  STRONG_BUY:  { label: 'Compra Fuerte', cls: 'badge badge-strong-buy' },
  BUY:         { label: 'Comprar',        cls: 'badge badge-buy' },
  NEUTRAL:     { label: 'Neutral',        cls: 'badge badge-neutral' },
  SELL:        { label: 'Vender',         cls: 'badge badge-sell' },
  STRONG_SELL: { label: 'Venta Fuerte',   cls: 'badge badge-strong-sell' },
};

export function SignalBadge({ signal }: { signal: SignalType }) {
  const { label, cls } = BADGE_CONFIG[signal] ?? BADGE_CONFIG.NEUTRAL;
  return <span className={cls}>{label}</span>;
}

export function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(((score + 9) / 18) * 100);
  const color =
    score >= 4 ? '#22c55e' :
    score >= 2 ? '#4ade80' :
    score <= -4 ? '#ef4444' :
    score <= -2 ? '#f97316' :
    '#94a3b8';
  return (
    <div className="score-bar-wrapper">
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="score-bar-label">{score > 0 ? '+' : ''}{score}</span>
    </div>
  );
}
