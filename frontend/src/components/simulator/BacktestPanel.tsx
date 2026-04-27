import { useState } from 'react';
import { fetchBacktest } from '../../api/client';
import { BacktestResult } from '../../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Trophy, AlertTriangle, Minus, Target } from 'lucide-react';

const RATING_CONFIG = {
  excellent: { label: '🏆 Excelente operación',  color: '#22c55e', bg: '#052e16' },
  good:      { label: '✅ Buena operación',        color: '#86efac', bg: '#052e16' },
  neutral:   { label: '➖ Operación neutra',       color: '#94a3b8', bg: '#1e2d45' },
  poor:      { label: '⚠️ Operación pobre',        color: '#fbbf24', bg: '#2d1a00' },
  bad:       { label: '❌ Mala operación',          color: '#ef4444', bg: '#2d0808' },
};

function pct(v: number) { return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`; }
function curr(v: number, sym = '$') { return `${v >= 0 ? '' : '-'}${sym}${Math.abs(v).toFixed(2)}`; }

export function BacktestPanel() {
  const [symbol,   setSymbol]   = useState('AAPL');
  const [buyDate,  setBuyDate]  = useState('');
  const [sellDate, setSellDate] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [amountMode, setAmountMode] = useState(false);
  const [amount,   setAmount]   = useState('1000');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [eurRate]               = useState(1.08); // approximate, good enough for backtesting display

  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<BacktestResult | null>(null);
  const [error,   setError]   = useState('');

  const sym = currency === 'EUR' ? '€' : '$';
  const convert = (usd: number) => currency === 'EUR' ? usd / eurRate : usd;

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const qty = amountMode
        ? undefined // server uses quantity=1, we'll scale on display
        : parseFloat(quantity) || 1;
      const res = await fetchBacktest({
        symbol: symbol.toUpperCase(),
        buyDate,
        sellDate: sellDate || undefined,
        quantity: qty,
      });
      // If amount mode: calculate effective quantity from investment amount
      if (amountMode) {
        const effectiveQty = parseFloat(amount) / (currency === 'EUR' ? res.buyPrice / eurRate : res.buyPrice);
        res.quantity = effectiveQty;
        res.pnl = (res.sellPrice - res.buyPrice) * effectiveQty;
      }
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err.message ?? 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  const rating = result ? RATING_CONFIG[result.rating] : null;

  // Max date for buy = yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxBuy = yesterday.toISOString().split('T')[0];
  const today  = new Date().toISOString().split('T')[0];

  return (
    <div className="sim-panel">
      {/* Form */}
      <form className="sim-form" onSubmit={run}>
        <div className="sim-form-row">
          <div className="tp-field">
            <label className="tp-label">Símbolo</label>
            <input className="tp-input" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL" required />
          </div>
          <div className="tp-field">
            <label className="tp-label">Moneda</label>
            <div className="currency-toggle-btns" style={{ padding: '4px 0' }}>
              <button type="button" className={`currency-btn${currency === 'USD' ? ' active' : ''}`}
                onClick={() => setCurrency('USD')}>$ USD</button>
              <button type="button" className={`currency-btn${currency === 'EUR' ? ' active' : ''}`}
                onClick={() => setCurrency('EUR')}>€ EUR</button>
            </div>
          </div>
        </div>

        <div className="sim-form-row">
          <div className="tp-field">
            <label className="tp-label">Fecha compra</label>
            <input className="tp-input" type="date" value={buyDate} onChange={e => setBuyDate(e.target.value)}
              max={maxBuy} required />
          </div>
          <div className="tp-field">
            <label className="tp-label">Fecha venta <span style={{ color: '#475569' }}>(vacío = hoy)</span></label>
            <input className="tp-input" type="date" value={sellDate} onChange={e => setSellDate(e.target.value)}
              min={buyDate} max={today} />
          </div>
        </div>

        {/* Quantity / Amount toggle */}
        <div className="tp-mode-toggle">
          <button type="button" className={`tp-mode-btn${!amountMode ? ' active' : ''}`}
            onClick={() => setAmountMode(false)}>Nº acciones</button>
          <button type="button" className={`tp-mode-btn${amountMode ? ' active' : ''}`}
            onClick={() => setAmountMode(true)}>Importe {sym}</button>
        </div>

        {!amountMode ? (
          <div className="tp-field">
            <label className="tp-label">Cantidad de acciones</label>
            <input className="tp-input" type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
              min="0.001" step="any" required />
          </div>
        ) : (
          <div className="tp-field">
            <label className="tp-label">Importe invertido ({sym})</label>
            <input className="tp-input" type="number" value={amount} onChange={e => setAmount(e.target.value)}
              min="1" step="any" required />
          </div>
        )}

        <button type="submit" className="tp-submit-btn tp-submit-buy" disabled={loading || !symbol || !buyDate}>
          {loading ? 'Analizando…' : '🔍 Simular operación'}
        </button>
      </form>

      {error && <div className="sim-error">{error}</div>}

      {result && rating && (
        <div className="sim-results">
          {/* Rating banner */}
          <div className="sim-rating-banner" style={{ background: rating.bg, borderColor: rating.color }}>
            <span style={{ color: rating.color, fontWeight: 700, fontSize: 14 }}>{rating.label}</span>
            {result.alphaSPX !== null && (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Alpha vs S&P 500: <strong style={{ color: result.alphaSPX >= 0 ? '#22c55e' : '#ef4444' }}>
                  {pct(result.alphaSPX)}
                </strong>
              </span>
            )}
          </div>

          {/* Metrics grid */}
          <div className="sim-metrics">
            <div className="sim-metric">
              <div className="sim-metric-label">Precio compra</div>
              <div className="sim-metric-value">{sym}{convert(result.buyPrice).toFixed(2)}</div>
              {currency === 'EUR' && <div className="dual-value">${result.buyPrice.toFixed(2)}</div>}
            </div>
            <div className="sim-metric">
              <div className="sim-metric-label">Precio venta</div>
              <div className="sim-metric-value">{sym}{convert(result.sellPrice).toFixed(2)}</div>
              {currency === 'EUR' && <div className="dual-value">${result.sellPrice.toFixed(2)}</div>}
            </div>
            <div className="sim-metric">
              <div className="sim-metric-label">P&L total</div>
              <div className="sim-metric-value" style={{ color: result.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                {curr(convert(result.pnl), sym)}
              </div>
              {currency === 'EUR' && (
                <div className="dual-value" style={{ color: result.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                  {curr(result.pnl, '$')}
                </div>
              )}
            </div>
            <div className="sim-metric">
              <div className="sim-metric-label">Rentabilidad</div>
              <div className="sim-metric-value" style={{ color: result.returnPct >= 0 ? '#22c55e' : '#ef4444' }}>
                {pct(result.returnPct)}
              </div>
            </div>
            <div className="sim-metric">
              <div className="sim-metric-label">Rentab. anualizada</div>
              <div className="sim-metric-value" style={{ color: result.annualizedReturn >= 0 ? '#22c55e' : '#ef4444' }}>
                {pct(result.annualizedReturn)}
              </div>
            </div>
            <div className="sim-metric">
              <div className="sim-metric-label">Días en cartera</div>
              <div className="sim-metric-value">{result.holdDays}d</div>
              <div className="dual-value">{Math.round(result.holdDays / 30)}m aprox.</div>
            </div>
          </div>

          {/* Benchmark comparison */}
          {(result.benchmarkReturnSPX !== null || result.benchmarkReturnIBEX !== null) && (
            <div className="sim-benchmarks">
              <div className="sim-bench-title">Comparativa de rentabilidad (mismo periodo)</div>
              <div className="sim-bench-row">
                <div className="sim-bench-item">
                  <span>{result.symbol}</span>
                  <strong style={{ color: result.returnPct >= 0 ? '#22c55e' : '#ef4444' }}>
                    {pct(result.returnPct)}
                  </strong>
                </div>
                {result.benchmarkReturnSPX !== null && (
                  <div className="sim-bench-item">
                    <span>S&P 500</span>
                    <strong style={{ color: result.benchmarkReturnSPX >= 0 ? '#22c55e' : '#ef4444' }}>
                      {pct(result.benchmarkReturnSPX)}
                    </strong>
                  </div>
                )}
                {result.benchmarkReturnIBEX !== null && (
                  <div className="sim-bench-item">
                    <span>IBEX 35</span>
                    <strong style={{ color: result.benchmarkReturnIBEX >= 0 ? '#22c55e' : '#ef4444' }}>
                      {pct(result.benchmarkReturnIBEX)}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chart */}
          {result.chart.length > 1 && (
            <div className="sim-chart-wrap">
              <div className="sim-chart-title">Rentabilidad acumulada desde compra (%)</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={result.chart} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }}
                    tickFormatter={d => d.slice(0, 7)} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }}
                    tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`} />
                  <Tooltip
                    contentStyle={{ background: '#0d1525', border: '1px solid #1e2d45', fontSize: 11 }}
                    formatter={(v: any, name: string) => [`${v > 0 ? '+' : ''}${Number(v).toFixed(2)}%`, name === 'symbol' ? result.symbol : name.toUpperCase()]}
                  />
                  <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" />
                  <Legend formatter={(v) => v === 'symbol' ? result.symbol : v.toUpperCase()}
                    wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="symbol" stroke="#3b82f6" dot={false} strokeWidth={2} />
                  {result.chart[0]?.spx !== undefined && (
                    <Line type="monotone" dataKey="spx" stroke="#f59e0b" dot={false} strokeWidth={1.5} strokeDasharray="4 2" />
                  )}
                  {result.chart[0]?.ibex !== undefined && (
                    <Line type="monotone" dataKey="ibex" stroke="#8b5cf6" dot={false} strokeWidth={1.5} strokeDasharray="2 3" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Context analysis */}
          <div className="sim-analysis">
            <div className="sim-analysis-title">Análisis de la operación</div>
            <div className="sim-analysis-grid">
              <AnalysisCard
                icon={result.returnPct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                label="Resultado absoluto"
                positive={result.returnPct >= 0}
                text={`${result.returnPct >= 0 ? 'Ganaste' : 'Perdiste'} ${pct(Math.abs(result.returnPct))} en ${result.holdDays} días de holding. Equivale a ${pct(result.annualizedReturn)} anualizado.`}
              />
              {result.alphaSPX !== null && (
                <AnalysisCard
                  icon={<Target size={14} />}
                  label="Vs mercado (Alpha)"
                  positive={result.alphaSPX >= 0}
                  text={result.alphaSPX >= 0
                    ? `Superaste al S&P 500 en ${pct(result.alphaSPX)} — alpha positivo.`
                    : `El S&P 500 lo hizo ${pct(Math.abs(result.alphaSPX))} mejor que tú — alpha negativo.`
                  }
                />
              )}
              <AnalysisCard
                icon={<Minus size={14} />}
                label="Horizonte temporal"
                positive={null}
                text={result.holdDays < 30
                  ? `Operación de corto plazo (${result.holdDays}d). El timing es crucial a este horizonte.`
                  : result.holdDays < 180
                  ? `Operación de medio plazo (${Math.round(result.holdDays / 30)}m). Depende mucho de los ciclos de mercado.`
                  : `Operación de largo plazo (${Math.round(result.holdDays / 30)}m). Las tendencias estructurales dominan.`
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisCard({ icon, label, positive, text }: {
  icon: React.ReactNode;
  label: string;
  positive: boolean | null;
  text: string;
}) {
  const color = positive === null ? '#94a3b8' : positive ? '#22c55e' : '#ef4444';
  return (
    <div className="sim-analysis-card">
      <div className="sim-analysis-card-label" style={{ color }}>{icon} {label}</div>
      <p className="sim-analysis-card-text">{text}</p>
    </div>
  );
}
