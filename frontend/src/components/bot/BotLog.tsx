import { BotLogEntry } from '../../types';
import { TrendingUp, TrendingDown, Minus, Search, Info, AlertCircle } from 'lucide-react';

interface Props { log: BotLogEntry[]; }

const ACTION_ICON: Record<string, React.ElementType> = {
  BUY: TrendingUp, SELL: TrendingDown, HOLD: Minus,
  SCAN: Search, INFO: Info, ERROR: AlertCircle,
};

const ACTION_COLOR: Record<string, string> = {
  BUY: '#22c55e', SELL: '#ef4444', HOLD: '#94a3b8',
  SCAN: '#3b82f6', INFO: '#475569', ERROR: '#f97316',
};

const ACTION_LABEL: Record<string, string> = {
  BUY: 'COMPRA', SELL: 'VENTA', HOLD: 'ESPERA',
  SCAN: 'SCAN', INFO: 'INFO', ERROR: 'ERROR',
};

export function BotLog({ log }: Props) {
  if (!log.length) {
    return (
      <div className="broker-empty" style={{ padding: 32 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>El bot no ha registrado actividad aún</div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Inicia el bot o ejecuta un scan manual</div>
      </div>
    );
  }

  return (
    <div className="bot-log">
      {log.map((entry) => {
        const Icon = ACTION_ICON[entry.action] ?? Info;
        const color = ACTION_COLOR[entry.action] ?? '#94a3b8';
        const label = ACTION_LABEL[entry.action] ?? entry.action;

        return (
          <div key={entry.id} className={`bot-log-row bot-log-${entry.action.toLowerCase()}`}>
            <div className="bot-log-time">
              {new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            <div className="bot-log-badge" style={{ background: `${color}22`, color, borderColor: `${color}44` }}>
              <Icon size={9} />
              {label}
            </div>

            {entry.symbol && (
              <div className="bot-log-symbol">{entry.symbol}</div>
            )}

            <div className="bot-log-reason">{entry.reason}</div>

            <div className="bot-log-meta">
              {entry.price != null && <span>${entry.price.toFixed(2)}</span>}
              {entry.rsi != null && <span>RSI {entry.rsi.toFixed(1)}</span>}
              {entry.score != null && (
                <span style={{ color: entry.score >= 3 ? '#22c55e' : entry.score <= -2 ? '#ef4444' : '#94a3b8' }}>
                  Score {entry.score > 0 ? '+' : ''}{entry.score}
                </span>
              )}
              {entry.pnl != null && (
                <span style={{ color: entry.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                  P&L {entry.pnl >= 0 ? '+' : ''}${entry.pnl.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
