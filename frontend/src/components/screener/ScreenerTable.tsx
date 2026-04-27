import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { fetchScreener } from '../../api/client';
import { ScreenerItem } from '../../types';
import { SignalBadge } from '../ui/Badge';
import { Sparkline } from '../ui/Sparkline';
import { ColoredValue } from '../ui/PriceChange';
import { TableSkeleton } from '../ui/LoadingSkeleton';
import { ScreenerFiltersPanel, ScreenerFilters } from './ScreenerFilters';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

function fmtLarge(v?: number) {
  if (!v) return '—';
  if (v >= 1e12) return (v / 1e12).toFixed(1) + 'T';
  if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  return v.toLocaleString();
}

type SK = keyof ScreenerItem;

function SortIco({ col, sk, ord }: { col: SK; sk: SK; ord: 'asc' | 'desc' }) {
  if (col !== sk) return <ChevronsUpDown size={9} style={{ color: '#475569', marginLeft: 3 }} />;
  return ord === 'asc'
    ? <ChevronUp size={9} style={{ color: '#60a5fa', marginLeft: 3 }} />
    : <ChevronDown size={9} style={{ color: '#60a5fa', marginLeft: 3 }} />;
}

const signalColor = (s: string) =>
  s === 'STRONG_BUY' || s === 'BUY' ? '#22c55e' :
  s === 'SELL' ? '#f97316' : s === 'STRONG_SELL' ? '#ef4444' : '#94a3b8';

export function ScreenerTable() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ScreenerFilters>({
    exchange: 'ALL', signal: 'ALL', minRSI: '', maxRSI: '', sector: 'ALL', q: '',
  });
  const [sk, setSk] = useState<SK>('score');
  const [ord, setOrd] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'table' | 'scatter'>('table');

  const params: Record<string, string> = { sortBy: sk as string, order: ord };
  if (filters.exchange !== 'ALL') params.exchange = filters.exchange;
  if (filters.signal !== 'ALL') params.signal = filters.signal;
  if (filters.minRSI) params.minRSI = filters.minRSI;
  if (filters.maxRSI) params.maxRSI = filters.maxRSI;
  if (filters.sector !== 'ALL') params.sector = filters.sector;
  if (filters.q) params.q = filters.q;

  const { data, isLoading } = useSWR(
    ['screener', JSON.stringify(params)],
    () => fetchScreener(params),
    { refreshInterval: 60000 }
  );

  function sortBy(key: SK) {
    if (key === sk) setOrd((o) => o === 'asc' ? 'desc' : 'asc');
    else { setSk(key); setOrd('desc'); }
  }

  const TH = ({ k, label }: { k: SK; label: string }) => (
    <th className="th" onClick={() => sortBy(k)} style={{ cursor: 'pointer' }}>
      {label}<SortIco col={k} sk={sk} ord={ord} />
    </th>
  );

  return (
    <div className="screener-page" style={{ height: '100%' }}>
      <ScreenerFiltersPanel filters={filters} onChange={setFilters} />

      {/* View toggle */}
      <div className="view-bar">
        <span className="view-count">{data ? `${data.length} resultados` : 'Cargando...'}</span>
        <div className="view-toggle">
          <button className={`view-btn${view === 'table' ? ' view-btn-active' : ''}`} onClick={() => setView('table')}>Tabla</button>
          <button className={`view-btn${view === 'scatter' ? ' view-btn-active' : ''}`} onClick={() => setView('scatter')}>Dispersión</button>
        </div>
      </div>

      {/* Scatter view */}
      {view === 'scatter' && data && (
        <div className="scatter-area">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 30 }}>
              <XAxis dataKey="rsi" name="RSI" type="number" domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                label={{ value: 'RSI (14)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis dataKey="changePercent" name="Cambio %"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                label={{ value: 'Cambio %', angle: -90, position: 'insideLeft', offset: 15, fill: '#94a3b8', fontSize: 11 }}
              />
              <ReferenceLine x={30} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine x={70} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 6, fontSize: 11 }}
                formatter={(v: number, n: string) => [v.toFixed(2), n]}
                labelFormatter={(_: unknown, payload: any[]) => payload?.[0]?.payload?.symbol ?? ''}
                cursor={{ fill: 'rgba(59,130,246,0.08)' }}
              />
              <Scatter data={data} onClick={(d) => navigate(`/chart/${d.symbol}`)}>
                {data.map((e) => <Cell key={e.symbol} fill={signalColor(e.signal)} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead style={{ position: 'sticky', top: 0, background: '#0f1623', zIndex: 5 }}>
              <tr style={{ borderBottom: '1px solid #1e2d45' }}>
                <TH k="symbol" label="Símbolo" />
                <TH k="shortName" label="Nombre" />
                <TH k="exchange" label="Mercado" />
                <TH k="sector" label="Sector" />
                <TH k="price" label="Precio" />
                <TH k="changePercent" label="Cambio %" />
                <TH k="volume" label="Volumen" />
                <TH k="marketCap" label="Cap." />
                <TH k="rsi" label="RSI" />
                <TH k="score" label="Score" />
                <th className="th">Señal</th>
                <th className="th">7D</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || !data ? (
                <tr><td colSpan={12}><TableSkeleton rows={20} /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={12} style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>Sin resultados</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.symbol} className="trow" onClick={() => navigate(`/chart/${encodeURIComponent(item.symbol)}`)}>
                    <td className="td" style={{ fontWeight: 600, color: '#e2e8f0' }}>{item.symbol}</td>
                    <td className="td" style={{ color: '#94a3b8', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.shortName}</td>
                    <td className="td" style={{ color: '#475569' }}>{item.exchange}</td>
                    <td className="td" style={{ color: '#475569', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sector ?? '—'}</td>
                    <td className="td">{item.price.toFixed(2)}</td>
                    <td className="td"><ColoredValue value={item.changePercent} format="percent" /></td>
                    <td className="td" style={{ color: '#94a3b8' }}>{fmtLarge(item.volume)}</td>
                    <td className="td" style={{ color: '#94a3b8' }}>{fmtLarge(item.marketCap)}</td>
                    <td className="td">
                      <span style={{ color: item.rsi > 70 ? '#ef4444' : item.rsi < 30 ? '#22c55e' : '#e2e8f0' }}>
                        {isNaN(item.rsi) ? '—' : item.rsi.toFixed(1)}
                      </span>
                    </td>
                    <td className="td">
                      <span style={{ color: item.score >= 2 ? '#22c55e' : item.score <= -2 ? '#ef4444' : '#94a3b8', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                        {item.score > 0 ? '+' : ''}{item.score}
                      </span>
                    </td>
                    <td className="td"><SignalBadge signal={item.signal} /></td>
                    <td className="td"><Sparkline data={item.sparkline} positive={item.changePercent >= 0} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
