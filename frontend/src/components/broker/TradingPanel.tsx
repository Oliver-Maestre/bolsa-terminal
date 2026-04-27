import { useState } from 'react';
import useSWR from 'swr';
import { fetchQuote, placeBrokerOrder } from '../../api/client';
import toast from 'react-hot-toast';
import { DollarSign, Euro } from 'lucide-react';

interface Props {
  defaultSymbol?: string;
  onTrade: () => void;
  currency: 'USD' | 'EUR';
  eurRate: number; // USD per 1 EUR (EURUSD=X price)
}

export function TradingPanel({ defaultSymbol = 'AAPL', onTrade, currency, eurRate }: Props) {
  const [symbol, setSymbol]     = useState(defaultSymbol.toUpperCase());
  const [side, setSide]         = useState<'BUY' | 'SELL'>('BUY');
  const [inputMode, setInputMode] = useState<'shares' | 'amount'>('shares');
  const [qty, setQty]           = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [sl, setSl]             = useState('');
  const [tp, setTp]             = useState('');
  const [loading, setLoading]   = useState(false);

  const symInput = symbol.trim().toUpperCase();
  const sym = currency === 'EUR' ? '€' : '$';

  const { data: quote, isLoading: qLoading } = useSWR(
    symInput ? ['/quote', symInput] : null,
    () => fetchQuote(symInput),
    { refreshInterval: 10000 }
  );

  // All internal logic stays in USD; eurRate = USD per EUR
  const priceUsd = quote?.regularMarketPrice ?? 0;
  const priceDisplay = currency === 'EUR' ? priceUsd / eurRate : priceUsd;

  // Derive shares from whichever input is active
  function getShares(): number {
    if (inputMode === 'shares') return parseFloat(qty) || 0;
    const displayAmount = parseFloat(amountInput) || 0;
    if (!priceDisplay) return 0;
    return displayAmount / priceDisplay;
  }

  const shares = getShares();
  const totalUsd = priceUsd * shares;
  const totalDisplay = currency === 'EUR' ? totalUsd / eurRate : totalUsd;
  const feeDisplay = totalDisplay * 0.001;

  // SL/TP are entered in display currency, stored in USD
  function slUsd()  { const v = parseFloat(sl);  return sl  ? (currency === 'EUR' ? v * eurRate : v) : undefined; }
  function tpUsd()  { const v = parseFloat(tp);  return tp  ? (currency === 'EUR' ? v * eurRate : v) : undefined; }

  // Placeholder helpers
  const slPlaceholder  = priceDisplay ? (priceDisplay * 0.95).toFixed(2) : '0';
  const tpPlaceholder  = priceDisplay ? (priceDisplay * 1.15).toFixed(2) : '0';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!symInput || !shares || shares <= 0) return;
    setLoading(true);
    try {
      const result = await placeBrokerOrder({
        symbol: symInput, side, quantity: shares,
        stopLoss: slUsd(),
        takeProfit: tpUsd(),
      });
      const execPriceUsd = result.order?.price ?? priceUsd;
      const execPriceDisplay = currency === 'EUR' ? execPriceUsd / eurRate : execPriceUsd;
      toast.success(`${side} ${shares.toFixed(2)} × ${symInput} a ${sym}${execPriceDisplay.toFixed(2)}`);
      setQty(''); setAmountInput(''); setSl(''); setTp('');
      onTrade();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Error al ejecutar orden');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="trading-panel">
      <div className="trading-panel-title">Nueva Orden</div>

      {/* Side selector */}
      <div className="side-selector">
        <button className={`side-btn${side === 'BUY'  ? ' side-btn-buy'  : ''}`} onClick={() => setSide('BUY')}>COMPRAR</button>
        <button className={`side-btn${side === 'SELL' ? ' side-btn-sell' : ''}`} onClick={() => setSide('SELL')}>VENDER</button>
      </div>

      <form onSubmit={submit}>
        {/* Symbol */}
        <div className="tp-field">
          <label className="tp-label">Símbolo</label>
          <input
            className="tp-input"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="AAPL"
          />
        </div>

        {/* Current price — both currencies */}
        <div className="tp-price-row">
          <span className="tp-label">Precio mercado</span>
          {qLoading ? (
            <div className="skeleton" style={{ width: 120, height: 16 }} />
          ) : priceUsd > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <span className="tp-price">{currency === 'EUR' ? `€${priceDisplay.toFixed(2)}` : `$${priceUsd.toFixed(2)}`}</span>
              <span style={{ fontSize: 10, color: '#475569' }}>
                {currency === 'EUR' ? `≈ $${priceUsd.toFixed(2)}` : `≈ €${(priceUsd / eurRate).toFixed(2)}`}
              </span>
            </div>
          ) : <span className="tp-price">—</span>}
        </div>

        {/* Input mode toggle */}
        <div className="tp-mode-toggle">
          <button
            type="button"
            className={`tp-mode-btn${inputMode === 'shares' ? ' active' : ''}`}
            onClick={() => setInputMode('shares')}
          >
            Nº acciones
          </button>
          <button
            type="button"
            className={`tp-mode-btn${inputMode === 'amount' ? ' active' : ''}`}
            onClick={() => setInputMode('amount')}
          >
            {currency === 'EUR' ? <><Euro size={10} /> Importe €</> : <><DollarSign size={10} /> Importe $</>}
          </button>
        </div>

        {/* Quantity / Amount input */}
        {inputMode === 'shares' ? (
          <div className="tp-field">
            <label className="tp-label">Cantidad (acciones)</label>
            <input
              className="tp-input"
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="10"
              min="0"
              step="any"
              required
            />
          </div>
        ) : (
          <div className="tp-field">
            <label className="tp-label">Importe a invertir ({currency})</label>
            <input
              className="tp-input"
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder={currency === 'EUR' ? '1000' : '1100'}
              min="0"
              step="any"
              required
            />
            {shares > 0 && priceDisplay > 0 && (
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>
                ≈ {shares.toFixed(4)} acciones
              </div>
            )}
          </div>
        )}

        {/* Stop Loss / Take Profit — only for BUY */}
        {side === 'BUY' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="tp-field">
              <label className="tp-label" style={{ color: '#ef4444' }}>Stop Loss {sym}</label>
              <input className="tp-input" type="number" value={sl} onChange={(e) => setSl(e.target.value)}
                placeholder={slPlaceholder} min="0" step="any" />
            </div>
            <div className="tp-field">
              <label className="tp-label" style={{ color: '#22c55e' }}>Take Profit {sym}</label>
              <input className="tp-input" type="number" value={tp} onChange={(e) => setTp(e.target.value)}
                placeholder={tpPlaceholder} min="0" step="any" />
            </div>
          </div>
        )}

        {/* Estimate */}
        {totalDisplay > 0 && (
          <div className="tp-estimate">
            <div>Estimado: <strong>{sym}{totalDisplay.toFixed(2)}</strong> + comisión {sym}{feeDisplay.toFixed(2)}</div>
            {currency === 'EUR' && (
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                ≈ ${totalUsd.toFixed(2)} USD
              </div>
            )}
            {currency === 'USD' && (
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                ≈ €{(totalUsd / eurRate).toFixed(2)} EUR
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !symInput || !shares}
          className={`tp-submit-btn ${side === 'BUY' ? 'tp-submit-buy' : 'tp-submit-sell'}`}
        >
          {loading ? '...' : `${side === 'BUY' ? 'Comprar' : 'Vender'} ${symInput}`}
        </button>
      </form>
    </div>
  );
}
