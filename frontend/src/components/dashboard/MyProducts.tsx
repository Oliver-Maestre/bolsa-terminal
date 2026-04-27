import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { usePortfolio } from '../../store';
import { fetchBatchQuotes, fetchBrokerAccount } from '../../api/client';
import { Sparkline } from '../ui/Sparkline';
import { TrendingUp, TrendingDown, Briefcase, Landmark } from 'lucide-react';

function pct(v: number) { return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`; }

export function MyProducts() {
  const navigate = useNavigate();
  const { positions } = usePortfolio();

  const symbols = positions.map((p) => p.symbol);
  const { data: quotesArr } = useSWR(
    symbols.length ? ['my-products-quotes', ...symbols] : null,
    () => fetchBatchQuotes(symbols),
    { refreshInterval: 15000 }
  );
  const { data: brokerAccount } = useSWR('/broker/account', fetchBrokerAccount, { refreshInterval: 10000 });

  const quoteMap = Object.fromEntries((quotesArr ?? []).map((q: any) => [q.symbol, q]));
  const brokerPositions = brokerAccount?.positions ?? [];
  const hasBroker = brokerPositions.length > 0;
  const hasPortfolio = positions.length > 0;

  if (!hasPortfolio && !hasBroker) {
    return (
      <div className="my-products-empty">
        <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Sin productos todavía</div>
        <div style={{ fontSize: 11, color: '#475569' }}>
          Añade activos en <button className="inline-link" onClick={() => navigate('/portfolio')}>Portfolio</button> o
          opera en <button className="inline-link" onClick={() => navigate('/broker')}>Broker</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-products">
      {/* Portfolio positions */}
      {hasPortfolio && (
        <div className="my-products-section">
          <div className="my-products-section-title">
            <Briefcase size={11} /> Portfolio Personal
          </div>
          <div className="my-products-grid">
            {positions.map((pos) => {
              const q = quoteMap[pos.symbol];
              const price = q?.regularMarketPrice ?? pos.avgCost;
              const pnl = (price - pos.avgCost) * pos.quantity;
              const pnlPct = ((price - pos.avgCost) / pos.avgCost) * 100;
              const dayChg = q?.regularMarketChangePercent ?? 0;
              const sparkData = Array.from({ length: 20 }, (_, i) =>
                pos.avgCost * (1 + (Math.sin(i * 0.5) * 0.03) + (pnlPct / 100) * (i / 19))
              );
              return (
                <div key={pos.symbol} className="product-card" onClick={() => navigate(`/chart/${encodeURIComponent(pos.symbol)}`)}>
                  <div className="product-card-top">
                    <div>
                      <div className="product-symbol">{pos.symbol}</div>
                      <div className="product-name">{pos.name}</div>
                    </div>
                    <div className={`product-change ${dayChg >= 0 ? 'pos' : 'neg'}`}>
                      {dayChg >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {pct(dayChg)}
                    </div>
                  </div>
                  <div className="product-spark">
                    <Sparkline data={sparkData} width={100} height={32} positive={pnlPct >= 0} />
                  </div>
                  <div className="product-card-bottom">
                    <div className="product-price">${price.toFixed(2)}</div>
                    <div className={`product-pnl ${pnl >= 0 ? 'pos' : 'neg'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pct(pnlPct)})
                    </div>
                  </div>
                  <div className="product-qty">{pos.quantity} acciones · Coste medio ${pos.avgCost.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Broker paper positions */}
      {hasBroker && (
        <div className="my-products-section">
          <div className="my-products-section-title">
            <Landmark size={11} /> Paper Trading (Broker)
          </div>
          <div className="my-products-grid">
            {brokerPositions.map((pos: any) => (
              <div key={pos.symbol} className="product-card product-card-broker" onClick={() => navigate(`/chart/${encodeURIComponent(pos.symbol)}`)}>
                <div className="product-card-top">
                  <div>
                    <div className="product-symbol">{pos.symbol}</div>
                    <div className="product-name">{pos.source === 'BOT' ? '🤖 Bot' : '👤 Manual'}</div>
                  </div>
                  <div className={`product-change ${pos.pnlPct >= 0 ? 'pos' : 'neg'}`}>
                    {pos.pnlPct >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {pct(pos.pnlPct)}
                  </div>
                </div>
                <div className="product-card-bottom" style={{ marginTop: 8 }}>
                  <div className="product-price">${pos.currentPrice.toFixed(2)}</div>
                  <div className={`product-pnl ${pos.pnl >= 0 ? 'pos' : 'neg'}`}>
                    {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                  </div>
                </div>
                <div className="product-qty">{pos.quantity} acc. · Coste ${pos.avgCost.toFixed(2)}</div>
                {pos.stopLoss && (
                  <div className="product-levels">
                    <span style={{ color: '#ef4444' }}>SL ${pos.stopLoss.toFixed(2)}</span>
                    {pos.takeProfit && <span style={{ color: '#22c55e' }}>TP ${pos.takeProfit.toFixed(2)}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
