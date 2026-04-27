import { Router, Request, Response } from 'express';
import * as cache from '../services/cache';
import { ScreenerItem } from '../types/index';

const router = Router();

// GET /api/screener?exchange=NASDAQ&minRSI=20&maxRSI=40&signal=BUY&sortBy=rsi&order=asc
router.get('/', (req: Request, res: Response) => {
  const allItems = cache.get<ScreenerItem[]>('screener:all') ?? [];

  let filtered = [...allItems];

  // Exchange filter
  const exchange = req.query.exchange as string;
  if (exchange && exchange !== 'ALL') {
    filtered = filtered.filter((i) => i.exchange === exchange);
  }

  // Signal filter
  const signal = req.query.signal as string;
  if (signal && signal !== 'ALL') {
    filtered = filtered.filter((i) => i.signal === signal);
  }

  // RSI range
  const minRSI = parseFloat(req.query.minRSI as string);
  const maxRSI = parseFloat(req.query.maxRSI as string);
  if (!isNaN(minRSI)) filtered = filtered.filter((i) => i.rsi >= minRSI);
  if (!isNaN(maxRSI)) filtered = filtered.filter((i) => i.rsi <= maxRSI);

  // Sector filter
  const sector = req.query.sector as string;
  if (sector && sector !== 'ALL') {
    filtered = filtered.filter((i) => i.sector === sector);
  }

  // Search query
  const q = (req.query.q as string || '').toUpperCase();
  if (q) {
    filtered = filtered.filter(
      (i) => i.symbol.includes(q) || i.shortName.toUpperCase().includes(q)
    );
  }

  // Sorting
  const sortBy = (req.query.sortBy as string) || 'symbol';
  const order = req.query.order === 'desc' ? -1 : 1;

  const sortMap: Record<string, (a: ScreenerItem, b: ScreenerItem) => number> = {
    symbol: (a, b) => a.symbol.localeCompare(b.symbol) * order,
    price: (a, b) => (a.price - b.price) * order,
    changePercent: (a, b) => (a.changePercent - b.changePercent) * order,
    volume: (a, b) => (a.volume - b.volume) * order,
    marketCap: (a, b) => ((a.marketCap ?? 0) - (b.marketCap ?? 0)) * order,
    rsi: (a, b) => (a.rsi - b.rsi) * order,
    score: (a, b) => (a.score - b.score) * order,
  };

  if (sortMap[sortBy]) filtered.sort(sortMap[sortBy]);

  res.json(filtered);
});

export default router;
