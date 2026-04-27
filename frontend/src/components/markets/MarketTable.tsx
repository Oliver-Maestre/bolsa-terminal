import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { fetchScreener } from '../../api/client';
import { ScreenerItem } from '../../types';
import { SignalBadge } from '../ui/Badge';
import { Sparkline } from '../ui/Sparkline';
import { ColoredValue } from '../ui/PriceChange';
import { TableSkeleton } from '../ui/LoadingSkeleton';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

function fmtLarge(v?: number) {
  if (!v) return '—';
  if (v >= 1e12) return (v / 1e12).toFixed(1) + 'T';
  if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  return v.toLocaleString();
}

type SK = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap' | 'rsi' | 'score';

function SortIco({ col, sk, ord }: { col: SK; sk: SK; ord: 'asc' | 'desc' }) {
  if (col !== sk) return <ChevronsUpDown size={10} style={{ color: '#475569', marginLeft: 3 }} />;
  return ord === 'asc'
    ? <ChevronUp size={10} style={{ color: '#60a5fa', marginLeft: 3 }} />
    : <ChevronDown size={10} style={{ color: '#60a5fa', marginLeft: 3 }} />;
}

export function MarketTable({ exchange }: { exchange?: string }) {
  const navigate = useNavigate();
  const [sk, setSk] = useState<SK>('changePercent');
  const [ord, setOrd] = useState<'asc' | 'desc'>('desc');

  const params: Record<string, string> = { sortBy: sk, order: ord };
  if (exchange && exchange !== 'ALL') params.exchange = exchange;

  const { data, isLoading } = useSWR(
    ['screener-tbl', JSON.stringify(params)],
    () => fetchScreener(params),
    { refreshInterval: 30000 }
  );

  function sort(key: SK) {
    if (key === sk) setOrd((o) => o === 'asc' ? 'desc' : 'asc');
    else { setSk(key); setOrd('desc'); }
  }

  const TH = ({ k, label }: { k: SK; label: string }) => (
    <th className="th" onClick={() => sort(k)}>
      {label}<SortIco col={k} sk={sk} ord={ord} />
    </th>
  );

  return (
    <div style={{ overflowX: 'auto', height: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
        <thead style={{ position: 'sticky', top: 0, background: '#0f1623', zIndex: 5 }}>
          <tr style={{ borderBottom: '1px solid #1e2d45' }}>
            <TH k="symbol" label="Símbolo" />
            <th className="th">Nombre</th>
            <th className="th">Mercado</th>
            <TH k="price" label="Precio" />
            <TH k="changePercent" label="Cambio %" />
            <TH k="volume" label="Volumen" />
            <TH k="marketCap" label="Cap." />
            <TH k="rsi" label="RSI" />
            <TH k="score" label="Señal" />
            <th className="th">7D</th>
          </tr>
        </thead>
        <tbody>
          {isLoading || !data ? (
            <tr><td colSpan={10}><TableSkeleton rows={15} /></td></tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            data.map((item: ScreenerItem) => (
              <tr key={item.symbol} className="trow" onClick={() => navigate(`/chart/${encodeURIComponent(item.symbol)}`)}>
                <td className="td" style={{ fontWeight: 600, color: '#e2e8f0' }}>{item.symbol}</td>
                <td className="td" style={{ color: '#94a3b8', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.shortName}
                </td>
                <td className="td" style={{ color: '#475569' }}>{item.exchange}</td>
                <td className="td">{item.price.toFixed(2)}</td>
                <td className="td"><ColoredValue value={item.changePercent} format="percent" /></td>
                <td className="td" style={{ color: '#94a3b8' }}>{fmtLarge(item.volume)}</td>
                <td className="td" style={{ color: '#94a3b8' }}>{fmtLarge(item.marketCap)}</td>
                <td className="td">
                  <span style={{ color: item.rsi > 70 ? '#ef4444' : item.rsi < 30 ? '#22c55e' : '#e2e8f0' }}>
                    {isNaN(item.rsi) ? '—' : item.rsi.toFixed(1)}
                  </span>
                </td>
                <td className="td"><SignalBadge signal={item.signal} /></td>
                <td className="td">
                  <Sparkline data={item.sparkline} positive={item.changePercent >= 0} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
