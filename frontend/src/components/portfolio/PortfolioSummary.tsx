import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import { QuoteSummary, PortfolioPosition } from '../../types';

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPct: number;
  dayPnL: number;
  positionCount: number;
}

export function computeMetrics(positions: PortfolioPosition[], quotes: Record<string, QuoteSummary>): PortfolioMetrics {
  let totalValue = 0, totalCost = 0, dayPnL = 0;
  for (const pos of positions) {
    const q = quotes[pos.symbol];
    if (!q) continue;
    totalValue += pos.quantity * q.regularMarketPrice;
    totalCost  += pos.quantity * pos.avgCost;
    dayPnL     += pos.quantity * q.regularMarketChange;
  }
  const totalPnL    = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  return { totalValue, totalCost, totalPnL, totalPnLPct, dayPnL, positionCount: positions.length };
}

function curr(v: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);
}

interface CardProps { icon: React.ElementType; label: string; value: string; sub?: string; valueColor?: string; }

function MetricCard({ icon: Icon, label, value, sub, valueColor }: CardProps) {
  return (
    <div className="metric-card">
      <div className="metric-card-label"><Icon size={13} />{label}</div>
      <div className="metric-card-value" style={{ color: valueColor ?? '#e2e8f0' }}>{value}</div>
      {sub && <div className="metric-card-sub">{sub}</div>}
    </div>
  );
}

export function PortfolioSummaryCards({ metrics }: { metrics: PortfolioMetrics }) {
  return (
    <div className="portfolio-metrics">
      <MetricCard icon={DollarSign} label="Valor Total" value={curr(metrics.totalValue)} sub={`Coste: ${curr(metrics.totalCost)}`} />
      <MetricCard
        icon={metrics.totalPnL >= 0 ? TrendingUp : TrendingDown}
        label="P&L Total"
        value={`${metrics.totalPnL >= 0 ? '+' : ''}${curr(metrics.totalPnL)}`}
        sub={`${metrics.totalPnLPct >= 0 ? '+' : ''}${metrics.totalPnLPct.toFixed(2)}%`}
        valueColor={metrics.totalPnL >= 0 ? '#22c55e' : '#ef4444'}
      />
      <MetricCard
        icon={metrics.dayPnL >= 0 ? TrendingUp : TrendingDown}
        label="P&L Hoy"
        value={`${metrics.dayPnL >= 0 ? '+' : ''}${curr(metrics.dayPnL)}`}
        valueColor={metrics.dayPnL >= 0 ? '#22c55e' : '#ef4444'}
      />
      <MetricCard icon={BarChart2} label="Posiciones" value={String(metrics.positionCount)} />
    </div>
  );
}
