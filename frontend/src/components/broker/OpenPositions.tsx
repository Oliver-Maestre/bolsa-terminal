import { useNavigate } from 'react-router-dom';
import { BrokerPosition } from '../../types';
import { placeBrokerOrder, sellAllBroker } from '../../api/client';
import toast from 'react-hot-toast';

interface CurrencyProps {
  currency: 'USD' | 'EUR';
  eurRate: number;
}

interface Props extends CurrencyProps {
  positions: BrokerPosition[];
  onRefresh: () => void;
}

function fmt(v: number, currency: 'USD' | 'EUR', eurRate: number) {
  const amount = currency === 'EUR' ? v / eurRate : v;
  const sym = currency === 'EUR' ? '€' : '$';
  return `${sym}${amount.toFixed(2)}`;
}

export function OpenPositions({ positions, onRefresh, currency, eurRate }: Props) {
  const navigate = useNavigate();

  async function handleSellAll(symbol: string) {
    try {
      await sellAllBroker(symbol);
      toast.success(`${symbol} vendido completamente`);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Error al vender');
    }
  }

  if (!positions.length) {
    return (
      <div className="broker-empty">
        <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>Sin posiciones abiertas</div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Usa el panel de trading para abrir una operación</div>
      </div>
    );
  }

  const sym = currency === 'EUR' ? '€' : '$';

  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 750 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1e2d45' }}>
            {['Símbolo', 'Fuente', 'Cantidad', `Coste Medio (${sym})`, `Precio (${sym})`, `Valor (${sym})`, `P&L (${sym})`, 'P&L%', `SL (${sym})`, `TP (${sym})`, ''].map((h) => (
              <th key={h} className="th">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr key={pos.symbol} className="trow">
              <td className="td">
                <button className="sym-link" onClick={() => navigate(`/chart/${encodeURIComponent(pos.symbol)}`)}>
                  {pos.symbol}
                </button>
              </td>
              <td className="td">
                <span className={`source-badge source-${pos.source.toLowerCase()}`}>{pos.source}</span>
              </td>
              <td className="td">{pos.quantity.toLocaleString()}</td>
              <td className="td" style={{ color: '#94a3b8' }}>
                {fmt(pos.avgCost, currency, eurRate)}
                {currency === 'EUR' && <span className="dual-value">${pos.avgCost.toFixed(2)}</span>}
              </td>
              <td className="td">
                {fmt(pos.currentPrice, currency, eurRate)}
                {currency === 'EUR' && <span className="dual-value">${pos.currentPrice.toFixed(2)}</span>}
              </td>
              <td className="td">
                {fmt(pos.value, currency, eurRate)}
                {currency === 'EUR' && <span className="dual-value">${pos.value.toFixed(2)}</span>}
              </td>
              <td className="td">
                <span style={{ color: pos.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                  {pos.pnl >= 0 ? '+' : ''}{fmt(pos.pnl, currency, eurRate)}
                </span>
                {currency === 'EUR' && (
                  <span className="dual-value" style={{ color: pos.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                    {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                  </span>
                )}
              </td>
              <td className="td">
                <span style={{ color: pos.pnlPct >= 0 ? '#22c55e' : '#ef4444' }}>
                  {pos.pnlPct >= 0 ? '+' : ''}{pos.pnlPct.toFixed(2)}%
                </span>
              </td>
              <td className="td" style={{ color: '#ef4444', fontSize: 10 }}>
                {pos.stopLoss ? fmt(pos.stopLoss, currency, eurRate) : '—'}
              </td>
              <td className="td" style={{ color: '#22c55e', fontSize: 10 }}>
                {pos.takeProfit ? fmt(pos.takeProfit, currency, eurRate) : '—'}
              </td>
              <td className="td">
                <button className="btn-sell-sm" onClick={() => handleSellAll(pos.symbol)}>
                  Vender
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
