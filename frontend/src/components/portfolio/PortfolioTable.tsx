import { Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PortfolioPosition, QuoteSummary } from '../../types';

interface Props {
  positions: PortfolioPosition[];
  quotes: Record<string, QuoteSummary>;
  onRemove: (id: string) => void;
  onEdit: (pos: PortfolioPosition) => void;
}

export function PortfolioTable({ positions, quotes, onRemove, onEdit }: Props) {
  const navigate = useNavigate();

  if (!positions.length) {
    return (
      <div className="portfolio-empty">
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 6 }}>Tu portfolio está vacío</div>
        <div style={{ fontSize: 12, color: '#475569' }}>
          Añade posiciones pulsando "+ Portfolio" en cualquier activo
        </div>
      </div>
    );
  }

  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1e2d45' }}>
            {['Símbolo', 'Nombre', 'Cantidad', 'Coste Medio', 'Precio', 'Valor', 'P&L', 'P&L%', 'Hoy', ''].map((h) => (
              <th key={h} className="th">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => {
            const q = quotes[pos.symbol];
            const price = q?.regularMarketPrice ?? 0;
            const value = pos.quantity * price;
            const cost  = pos.quantity * pos.avgCost;
            const pnl   = value - cost;
            const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
            const dayPnl = pos.quantity * (q?.regularMarketChange ?? 0);

            return (
              <tr key={pos.id} style={{ borderBottom: '1px solid #1e2d4540' }} className="trow">
                <td className="td">
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 12, padding: 0 }}
                    onClick={() => navigate(`/chart/${encodeURIComponent(pos.symbol)}`)}
                  >
                    {pos.symbol}
                  </button>
                </td>
                <td className="td" style={{ color: '#94a3b8', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pos.name}</td>
                <td className="td">{pos.quantity.toLocaleString()}</td>
                <td className="td" style={{ color: '#94a3b8' }}>{pos.avgCost.toFixed(2)}</td>
                <td className="td">{price.toFixed(2)}</td>
                <td className="td">{value.toFixed(2)}</td>
                <td className="td"><span style={{ color: pnl >= 0 ? '#22c55e' : '#ef4444' }}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}</span></td>
                <td className="td"><span style={{ color: pnlPct >= 0 ? '#22c55e' : '#ef4444' }}>{pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</span></td>
                <td className="td"><span style={{ color: dayPnl >= 0 ? '#22c55e' : '#ef4444' }}>{dayPnl >= 0 ? '+' : ''}{dayPnl.toFixed(2)}</span></td>
                <td className="td">
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="icon-btn" onClick={() => onEdit(pos)}><Edit size={12} /></button>
                    <button className="icon-btn" onClick={() => onRemove(pos.id)}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
