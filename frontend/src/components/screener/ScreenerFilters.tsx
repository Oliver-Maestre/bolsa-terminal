import { Filter, RotateCcw } from 'lucide-react';

export interface ScreenerFilters {
  exchange: string;
  signal: string;
  minRSI: string;
  maxRSI: string;
  sector: string;
  q: string;
}

interface Props {
  filters: ScreenerFilters;
  onChange: (f: ScreenerFilters) => void;
}

const EXCHANGES = ['ALL', 'NYSE', 'NASDAQ', 'BME', 'LSE', 'CRYPTO'];
const SIGNALS = ['ALL', 'STRONG_BUY', 'BUY', 'NEUTRAL', 'SELL', 'STRONG_SELL'];
const SIG_LABELS: Record<string, string> = {
  ALL: 'Todas señales', STRONG_BUY: 'Compra Fuerte', BUY: 'Comprar',
  NEUTRAL: 'Neutral', SELL: 'Vender', STRONG_SELL: 'Venta Fuerte',
};
const SECTORS = [
  'ALL', 'Technology', 'Financial Services', 'Healthcare',
  'Consumer Cyclical', 'Consumer Defensive', 'Energy',
  'Communication Services', 'Utilities', 'Industrials', 'Basic Materials', 'Cryptocurrency',
];

export function ScreenerFiltersPanel({ filters, onChange }: Props) {
  const set = (k: keyof ScreenerFilters, v: string) => onChange({ ...filters, [k]: v });
  const reset = () => onChange({ exchange: 'ALL', signal: 'ALL', minRSI: '', maxRSI: '', sector: 'ALL', q: '' });

  return (
    <div className="filters-bar">
      <span className="filter-label"><Filter size={11} /> Filtros:</span>

      <input
        className="filter-input"
        placeholder="Buscar símbolo..."
        value={filters.q}
        onChange={(e) => set('q', e.target.value)}
      />

      <select className="filter-select" value={filters.exchange} onChange={(e) => set('exchange', e.target.value)}>
        {EXCHANGES.map((e) => <option key={e} value={e}>{e}</option>)}
      </select>

      <select className="filter-select" value={filters.sector} onChange={(e) => set('sector', e.target.value)}>
        {SECTORS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'Todos los sectores' : s}</option>)}
      </select>

      <select className="filter-select" value={filters.signal} onChange={(e) => set('signal', e.target.value)}>
        {SIGNALS.map((s) => <option key={s} value={s}>{SIG_LABELS[s]}</option>)}
      </select>

      <span className="filter-label" style={{ gap: 5 }}>
        RSI:
        <input className="filter-input filter-input-small" type="number" placeholder="0" min="0" max="100"
          value={filters.minRSI} onChange={(e) => set('minRSI', e.target.value)} />
        –
        <input className="filter-input filter-input-small" type="number" placeholder="100" min="0" max="100"
          value={filters.maxRSI} onChange={(e) => set('maxRSI', e.target.value)} />
      </span>

      <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={reset}>
        <RotateCcw size={11} /> Reset
      </button>
    </div>
  );
}
