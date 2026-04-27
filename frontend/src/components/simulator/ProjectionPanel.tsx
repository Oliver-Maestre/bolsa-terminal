import { useState } from 'react';
import { fetchProjection } from '../../api/client';
import { ProjectionResult } from '../../types';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

function pct(v: number) { return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`; }
function curr(v: number, sym: string) { return `${sym}${v.toFixed(0)}`; }

const PROB_COLOR = (p: number) =>
  p >= 70 ? '#22c55e' : p >= 50 ? '#86efac' : p >= 35 ? '#fbbf24' : '#ef4444';

export function ProjectionPanel() {
  const [symbol,   setSymbol]   = useState('AAPL');
  const [amount,   setAmount]   = useState('1000');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [eurRate]               = useState(1.08);

  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<ProjectionResult | null>(null);
  const [error,   setError]   = useState('');

  const sym = currency === 'EUR' ? '€' : '$';
  const toSym = (usd: number) => currency === 'EUR' ? usd / eurRate : usd;

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const amountUsd = currency === 'EUR'
        ? parseFloat(amount) * eurRate
        : parseFloat(amount);
      const res = await fetchProjection({ symbol: symbol.toUpperCase(), amount: amountUsd });
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err.message ?? 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  // Build chart data: investment reference + projections
  const chartData = result ? [
    {
      name: 'Hoy',
      p5: toSym(result.investment), p25: toSym(result.investment),
      p50: toSym(result.investment), p75: toSym(result.investment), p95: toSym(result.investment),
    },
    ...result.projections.map(p => ({
      name: p.label,
      p5:  toSym(p.p5),  p25: toSym(p.p25), p50: toSym(p.p50),
      p75: toSym(p.p75), p95: toSym(p.p95),
    })),
  ] : [];

  const investDisplay = result ? toSym(result.investment) : 0;

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
        <div className="tp-field">
          <label className="tp-label">Importe a invertir ({sym})</label>
          <input className="tp-input" type="number" value={amount}
            onChange={e => setAmount(e.target.value)} min="1" step="any" required />
        </div>
        <button type="submit" className="tp-submit-btn tp-submit-buy" disabled={loading || !symbol}>
          {loading ? 'Calculando simulaciones…' : '📈 Proyectar (Monte Carlo)'}
        </button>
      </form>

      {error && <div className="sim-error">{error}</div>}

      {result && (
        <div className="sim-results">
          {/* Headline stats */}
          <div className="sim-metrics">
            <div className="sim-metric">
              <div className="sim-metric-label">Precio actual</div>
              <div className="sim-metric-value">{sym}{toSym(result.currentPrice).toFixed(2)}</div>
            </div>
            <div className="sim-metric">
              <div className="sim-metric-label">Acciones</div>
              <div className="sim-metric-value">{result.shares.toFixed(4)}</div>
            </div>
            <div className="sim-metric">
              <div className="sim-metric-label">Retorno histórico anual</div>
              <div className="sim-metric-value" style={{ color: result.annualReturn >= 0 ? '#22c55e' : '#ef4444' }}>
                {pct(result.annualReturn)}
              </div>
            </div>
            <div className="sim-metric">
              <div className="sim-metric-label">Volatilidad anual</div>
              <div className="sim-metric-value" style={{ color: result.annualVol > 40 ? '#ef4444' : result.annualVol > 20 ? '#fbbf24' : '#22c55e' }}>
                {result.annualVol.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Fan chart */}
          <div className="sim-chart-wrap">
            <div className="sim-chart-title">
              Cono de proyección — {result.symbol} — {sym}{curr(investDisplay, '')} invertidos
              <span style={{ fontSize: 10, color: '#475569', marginLeft: 8 }}>
                2.000 simulaciones · GBM · {result.dataPoints} sesiones de histórico
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `${sym}${v.toFixed(0)}`} />
                <Tooltip
                  contentStyle={{ background: '#0d1525', border: '1px solid #1e2d45', fontSize: 11 }}
                  formatter={(v: any, key: string) => {
                    const labels: Record<string, string> = {
                      p95: 'Muy optimista (P95)', p75: 'Optimista (P75)',
                      p50: 'Mediana (P50)', p25: 'Pesimista (P25)', p5: 'Muy pesimista (P5)',
                    };
                    return [`${sym}${Number(v).toFixed(2)}`, labels[key] ?? key];
                  }}
                />
                {/* Fan bands: outermost to innermost */}
                <Area type="monotone" dataKey="p95" stroke="#1d4ed8" fill="#1e3a8a" fillOpacity={0.15} dot={false} />
                <Area type="monotone" dataKey="p75" stroke="#2563eb" fill="#1d4ed8" fillOpacity={0.2} dot={false} />
                <Area type="monotone" dataKey="p25" stroke="#2563eb" fill="white"   fillOpacity={0} dot={false} />
                <Area type="monotone" dataKey="p5"  stroke="#1d4ed8" fill="white"   fillOpacity={0} dot={false} />
                <Line type="monotone" dataKey="p50" stroke="#60a5fa" strokeWidth={2} dot={false} name="Mediana" />
                <ReferenceLine y={investDisplay} stroke="#94a3b8" strokeDasharray="4 2" label={{ value: 'Inversión', fill: '#64748b', fontSize: 10 }} />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { color: '#1e3a8a', label: 'Zona P5–P95' },
                { color: '#1d4ed8', label: 'Zona P25–P75' },
                { color: '#60a5fa', label: 'Mediana (P50)' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#94a3b8' }}>
                  <div style={{ width: 12, height: 8, background: color, borderRadius: 2 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Projections table */}
          <div className="sim-proj-table-wrap">
            <table className="sim-proj-table">
              <thead>
                <tr>
                  <th>Horizonte</th>
                  <th>Pesimista (P25)</th>
                  <th>Esperado (P50)</th>
                  <th>Optimista (P75)</th>
                  <th>Prob. ganar</th>
                </tr>
              </thead>
              <tbody>
                {result.projections.map(p => (
                  <tr key={p.key}>
                    <td style={{ fontWeight: 600 }}>{p.label}</td>
                    <td>
                      <div style={{ color: p.retP25 >= 0 ? '#22c55e' : '#ef4444' }}>
                        {sym}{toSym(p.p25).toFixed(0)} <span style={{ fontSize: 10 }}>({pct(p.retP25)})</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: p.retP50 >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {sym}{toSym(p.p50).toFixed(0)} <span style={{ fontSize: 10 }}>({pct(p.retP50)})</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#22c55e' }}>
                        {sym}{toSym(p.p75).toFixed(0)} <span style={{ fontSize: 10 }}>({pct(p.retP75)})</span>
                      </div>
                    </td>
                    <td>
                      <div className="prob-pill" style={{ background: PROB_COLOR(p.probProfit) + '20', color: PROB_COLOR(p.probProfit) }}>
                        {p.probProfit.toFixed(0)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sim-disclaimer">
            ⚠️ <strong>Aviso legal:</strong> Las proyecciones se basan en el modelo de Movimiento Browniano Geométrico usando
            volatilidad e retorno histórico. <strong>No garantizan rendimientos futuros.</strong> Son una estimación estadística
            con fines educativos. Los mercados financieros son impredecibles.
          </div>
        </div>
      )}
    </div>
  );
}
