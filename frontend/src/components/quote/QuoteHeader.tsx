import { Star, Plus } from 'lucide-react';
import { QuoteSummary } from '../../types';
import { useWatchlist } from '../../store';
import { PriceChange } from '../ui/PriceChange';

interface Props {
  quote: QuoteSummary;
  onAddPortfolio?: () => void;
}

export function QuoteHeader({ quote, onAddPortfolio }: Props) {
  const { addSymbol, removeSymbol, hasSymbol } = useWatchlist();
  const inWl = hasSymbol(quote.symbol);

  return (
    <div className="quote-header">
      <div className="quote-header-left">
        <div className="quote-symbol-row">
          <span className="quote-symbol">{quote.symbol}</span>
          <span className="quote-badge">{quote.exchange}</span>
          <span className="quote-badge">{quote.quoteType}</span>
          <span className="quote-badge">{quote.currency}</span>
          <span className={quote.marketState === 'REGULAR' ? 'quote-status-open' : 'quote-status-closed'}>
            {quote.marketState === 'REGULAR' ? 'ABIERTO' : 'CERRADO'}
          </span>
        </div>
        <div className="quote-name">{quote.shortName}</div>
      </div>

      <div className="quote-price-block">
        <div className="quote-price">
          {quote.regularMarketPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
        </div>
        <PriceChange value={quote.regularMarketChange} percent={quote.regularMarketChangePercent} />
      </div>

      <div className="quote-header-actions">
        <button
          className="icon-btn"
          title={inWl ? 'Quitar de watchlist' : 'Añadir a watchlist'}
          onClick={() => inWl ? removeSymbol(quote.symbol) : addSymbol(quote.symbol)}
        >
          <Star size={14} style={{ color: inWl ? '#eab308' : '#475569', fill: inWl ? '#eab308' : 'none' }} />
        </button>
        {onAddPortfolio && (
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={onAddPortfolio}>
            <Plus size={12} /> Portfolio
          </button>
        )}
      </div>
    </div>
  );
}
