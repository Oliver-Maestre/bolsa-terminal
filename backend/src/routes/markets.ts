import { Router, Request, Response } from 'express';
import { getMockQuote, getMockHistory } from '../services/mockData';
import { getQuoteAggregated, getHistoryAggregated } from '../services/dataAggregator';
import { MARKETS, ALL_INDICES } from '../config/markets';
import * as cache from '../services/cache';
import { MarketIndex } from '../types/index';

const router = Router();

// GET /api/markets/overview — all indices with sparklines
router.get('/overview', async (_req: Request, res: Response) => {
  const cacheKey = 'markets:overview';
  const cached   = cache.get<MarketIndex[]>(cacheKey);
  if (cached) return res.json(cached);

  // Fetch all index quotes + sparklines in parallel using the aggregator chain
  const results = await Promise.allSettled(
    ALL_INDICES.map(async (idx) => {
      const [quoteResult, histResult] = await Promise.allSettled([
        getQuoteAggregated(idx.symbol),
        getHistoryAggregated(idx.symbol, '1mo', '1d'),
      ]);

      const q = quoteResult.status === 'fulfilled' ? quoteResult.value?.data : null;
      const bars = histResult.status === 'fulfilled' ? histResult.value?.bars ?? [] : [];

      // Fallback to mock if aggregator got nothing
      const quote    = q ?? getMockQuote(idx.symbol);
      const sparkBars = bars.length ? bars : getMockHistory(idx.symbol, '1mo');

      return {
        symbol:        idx.symbol,
        name:          idx.name,
        price:         quote?.regularMarketPrice ?? 0,
        change:        quote?.regularMarketChange ?? 0,
        changePercent: quote?.regularMarketChangePercent ?? 0,
        sparkline:     sparkBars.slice(-30).map(b => b.close),
        marketId:      (idx as any).marketId ?? '',
      } as MarketIndex;
    })
  );

  const data: MarketIndex[] = results
    .filter((r): r is PromiseFulfilledResult<MarketIndex> => r.status === 'fulfilled')
    .map(r => r.value);

  cache.set(cacheKey, data, 60); // 1 min TTL
  res.json(data);
});

// GET /api/markets/config — market configurations
router.get('/config', (_req: Request, res: Response) => {
  res.json(MARKETS.map(m => ({
    id:        m.id,
    name:      m.name,
    flag:      m.flag,
    timezone:  m.timezone,
    openTime:  m.openTime,
    closeTime: m.closeTime,
  })));
});

export default router;
