import { BrokerOrder } from '../../types';

interface CurrencyProps {
  currency: 'USD' | 'EUR';
  eurRate: number;
}

interface Props extends CurrencyProps {
  orders: BrokerOrder[];
}

function fmt(v: number, currency: 'USD' | 'EUR', eurRate: number) {
  const amount = currency === 'EUR' ? v / eurRate : v;
  const sym = currency === 'EUR' ? '€' : '$';
  return `${sym}${amount.toFixed(2)}`;
}

export function TradeHistory({ orders, currency, eurRate }: Props) {
  const sym = currency === 'EUR' ? '€' : '$';

  if (!orders.length) {
    return <div className="broker-empty" style={{ padding: 24 }}>Sin operaciones registradas</div>;
  }

  return (
    <div style={{ overflow: 'auto', maxHeight: 320 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
        <thead style={{ position: 'sticky', top: 0, background: '#0f1623', zIndex: 2 }}>
          <tr style={{ borderBottom: '1px solid #1e2d45' }}>
            {['Fecha', 'Símbolo', 'Lado', 'Cantidad', `Precio (${sym})`, `Total (${sym})`, `Comisión (${sym})`, 'Fuente'].map((h) => (
              <th key={h} className="th">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ borderBottom: '1px solid #1e2d4530' }}>
              <td className="td" style={{ color: '#475569', whiteSpace: 'nowrap' }}>
                {new Date(o.timestamp).toLocaleString('es-ES', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="td" style={{ fontWeight: 600 }}>{o.symbol}</td>
              <td className="td">
                <span className={`side-badge side-${o.side.toLowerCase()}`}>{o.side}</span>
              </td>
              <td className="td">{o.quantity.toLocaleString()}</td>
              <td className="td">
                {fmt(o.price, currency, eurRate)}
                {currency === 'EUR' && <span className="dual-value">${o.price.toFixed(2)}</span>}
              </td>
              <td className="td">
                {fmt(o.total, currency, eurRate)}
                {currency === 'EUR' && <span className="dual-value">${o.total.toFixed(2)}</span>}
              </td>
              <td className="td" style={{ color: '#475569' }}>
                -{fmt(o.fee, currency, eurRate)}
              </td>
              <td className="td">
                <span className={`source-badge source-${o.source.toLowerCase()}`}>{o.source}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
