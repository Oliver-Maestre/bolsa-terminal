import { BrokerAccount } from '../../types';
import { TrendingUp, TrendingDown, Activity, Award } from 'lucide-react';

interface CurrencyProps {
  currency: 'USD' | 'EUR';
  eurRate: number;
}

function formatCurr(v: number, currency: 'USD' | 'EUR', eurRate: number) {
  const amount = currency === 'EUR' ? v / eurRate : v;
  return new Intl.NumberFormat(currency === 'EUR' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function pct(v: number) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

interface Props extends CurrencyProps {
  account: BrokerAccount;
  onReset: () => void;
}

export function AccountCard({ account, onReset, currency, eurRate }: Props) {
  const eq   = account.totalEquity;
  const pnl  = account.totalPnL;
  const isPos = pnl >= 0;
  const fmt = (v: number) => formatCurr(v, currency, eurRate);
  const sym = currency === 'EUR' ? '€' : '$';

  return (
    <div className="broker-account-grid">
      {/* Equity */}
      <div className="broker-metric-card">
        <div className="broker-metric-label">
          <span style={{ fontSize: 14 }}>{sym}</span>
          Capital Total
        </div>
        <div className="broker-metric-value" style={{ fontSize: 22 }}>{fmt(eq)}</div>
        <div className="broker-metric-sub">
          Efectivo: {fmt(account.cash)}
          {currency === 'EUR' && (
            <span style={{ color: '#475569', marginLeft: 6 }}>
              (${account.cash.toFixed(0)})
            </span>
          )}
        </div>
      </div>

      {/* P&L */}
      <div className="broker-metric-card">
        <div className="broker-metric-label">
          {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          P&L Total
        </div>
        <div className="broker-metric-value" style={{ color: isPos ? '#22c55e' : '#ef4444', fontSize: 20 }}>
          {fmt(pnl)}
        </div>
        <div className="broker-metric-sub" style={{ color: isPos ? '#22c55e' : '#ef4444' }}>
          {pct(account.totalPnLPct)} vs capital inicial
        </div>
        {currency === 'EUR' && (
          <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
            ≈ ${pnl.toFixed(2)} USD
          </div>
        )}
      </div>

      {/* Positions */}
      <div className="broker-metric-card">
        <div className="broker-metric-label"><Activity size={12} />Posiciones</div>
        <div className="broker-metric-value">{account.positions.length}</div>
        <div className="broker-metric-sub">Invertido: {fmt(account.totalCost)}</div>
      </div>

      {/* Win rate */}
      <div className="broker-metric-card">
        <div className="broker-metric-label"><Award size={12} />Win Rate</div>
        <div className="broker-metric-value" style={{ color: account.winRate >= 50 ? '#22c55e' : '#ef4444' }}>
          {account.tradeCount > 0 ? `${account.winRate.toFixed(0)}%` : '—'}
        </div>
        <div className="broker-metric-sub">{account.winCount}W / {account.lossCount}L · {account.tradeCount} trades</div>
      </div>

      {/* Footer row */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <div style={{ fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center' }}>
          Capital inicial: {fmt(account.initialBalance)}
          {currency === 'EUR' && <span style={{ marginLeft: 4 }}>(${account.initialBalance.toFixed(0)})</span>}
          &nbsp;·&nbsp;Comisiones: {fmt(account.totalFeesPaid)}
        </div>
        <button className="btn-ghost" onClick={onReset}
          style={{ color: '#ef4444', fontSize: 10 }}
          title="Reiniciar cuenta paper — irreversible"
        >
          Reiniciar cuenta
        </button>
      </div>
    </div>
  );
}
