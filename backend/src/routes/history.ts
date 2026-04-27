import { Router, Request, Response } from 'express';
import { getHistoryAggregated } from '../services/dataAggregator';
import { getMockHistory } from '../services/mockData';
import { computeIndicators, computeRecommendation } from '../services/technicalAnalysis';

const router = Router();

// GET /api/history/:symbol?period=1y&interval=1d
router.get('/:symbol', async (req: Request, res: Response) => {
  const sym      = req.params.symbol.toUpperCase();
  const period   = (req.query.period as string) || '1y';
  const interval = (req.query.interval as string) || '1d';

  const result = await getHistoryAggregated(sym, period, interval);
  const bars   = result?.bars ?? [];
  const source = result?.source ?? 'mock';
  const isDemo = source === 'mock';

  // Final fallback
  const finalBars = bars.length ? bars : getMockHistory(sym, period);
  if (!finalBars.length) return res.status(404).json({ error: 'No data found for symbol' });

  const indicators     = computeIndicators(finalBars);
  const recommendation = computeRecommendation(finalBars, indicators);

  res.json({ symbol: sym, bars: finalBars, indicators, recommendation, source, _demo: isDemo });
});

export default router;
