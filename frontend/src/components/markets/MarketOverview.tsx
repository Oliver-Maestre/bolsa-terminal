import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { fetchMarketOverview } from '../../api/client';
import { Sparkline } from '../ui/Sparkline';
import { ColoredValue } from '../ui/PriceChange';
import { Skeleton } from '../ui/LoadingSkeleton';

const FLAGS: Record<string, string> = { NASDAQ: '🇺🇸', NYSE: '🇺🇸', BME: '🇪🇸', LSE: '🇬🇧', CRYPTO: '₿' };

export function MarketOverview() {
  const navigate = useNavigate();
  const { data, isLoading } = useSWR('/markets/overview', fetchMarketOverview, { refreshInterval: 60000 });

  if (isLoading || !data) {
    return (
      <div className="indices-grid">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} style={{ height: 78, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="indices-grid">
      {data.map((idx) => (
        <div
          key={idx.symbol}
          className="index-card"
          onClick={() => navigate(`/chart/${encodeURIComponent(idx.symbol)}`)}
        >
          <div className="index-card-name">
            <span>{FLAGS[idx.marketId] ?? '📊'}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{idx.name}</span>
          </div>
          <div className="index-card-price">
            {idx.price > 0
              ? idx.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '—'}
          </div>
          <div className="index-card-bottom">
            <ColoredValue value={idx.changePercent} format="percent" />
            <Sparkline data={idx.sparkline} positive={idx.changePercent >= 0} width={60} height={24} />
          </div>
        </div>
      ))}
    </div>
  );
}
