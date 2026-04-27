import { Router, Request, Response } from 'express';
import { getQuoteAggregated } from '../services/dataAggregator';
import { getMockQuote } from '../services/mockData';

const router = Router();

// GET /api/quotes/:symbol
router.get('/:symbol', async (req: Request, res: Response) => {
  const sym = req.params.symbol.toUpperCase();
  const result = await getQuoteAggregated(sym);
  if (result) return res.json({ ...result.data, source: result.source });

  const mock = getMockQuote(sym);
  if (!mock) return res.status(404).json({ error: 'Symbol not found' });
  res.json({ ...mock, _demo: true, source: 'mock' });
});

// GET /api/quotes?symbols=AAPL,MSFT
router.get('/', async (req: Request, res: Response) => {
  const symbolsParam = req.query.symbols as string;
  if (!symbolsParam) return res.status(400).json({ error: 'symbols query param required' });

  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).slice(0, 50);

  const results = await Promise.allSettled(symbols.map(sym => getQuoteAggregated(sym)));

  const quotes = results.map((r, i) => {
    if (r.status === 'fulfilled' && r.value) return { ...r.value.data, source: r.value.source };
    const mock = getMockQuote(symbols[i]);
    return mock ? { ...mock, _demo: true, source: 'mock' } : null;
  }).filter(Boolean);

  res.json(quotes);
});

export default router;
