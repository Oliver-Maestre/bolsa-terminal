import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import 'dotenv/config';

import quotesRouter    from './routes/quotes';
import historyRouter   from './routes/history';
import searchRouter    from './routes/search';
import screenerRouter  from './routes/screener';
import marketsRouter   from './routes/markets';
import brokerRouter    from './routes/broker';
import botRouter       from './routes/bot';
import aiRouter        from './routes/ai';
import simulatorRouter from './routes/simulator';

import { ALL_TICKERS } from './config/markets';
import { computeIndicators, computeRecommendation } from './services/technicalAnalysis';
import { generateMockScreener } from './services/mockData';
import { getQuoteAggregated, getHistoryAggregated } from './services/dataAggregator';
import * as cache from './services/cache';
import { ScreenerItem } from './types/index';
import { requireApiToken } from './middleware/auth';

const app  = express();
const PORT = process.env.PORT || 3001;

const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://localhost:4173'];
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : DEFAULT_ORIGINS;

// Middleware
app.use(cors({ origin: corsOrigins }));
// Never compress SSE streams — gzip buffers chunks and breaks real-time delivery.
// IMPORTANT: use req.originalUrl, not req.path — this filter runs lazily on
// the first res.write() *inside* the mounted router, by which point req.path
// has already been rewritten relative to the router's mount point (e.g.
// '/stream' instead of '/api/bot/stream'), so a req.path check silently
// never matches and gzip gets applied to a never-ending stream, which then
// hangs forever for any client that requests gzip (curl doesn't by default;
// URLSession does), because zlib never flushes its tiny buffered writes.
app.use(compression({
  filter: (req, res) => {
    if (req.originalUrl.startsWith('/api/bot/stream') || req.originalUrl.startsWith('/api/ai/chat')) return false;
    return compression.filter(req, res);
  },
}) as any);
app.use(express.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true });
app.use(limiter);

// Health check — no token required, so cloud providers can probe it freely.
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cacheStats: cache.stats(),
    screenerCount: (cache.get<ScreenerItem[]>('screener:all') ?? []).length,
  });
});

app.use('/api', requireApiToken);

// Routes
app.use('/api/quotes',    quotesRouter);
app.use('/api/history',   historyRouter);
app.use('/api/search',    searchRouter);
app.use('/api/screener',  screenerRouter);
app.use('/api/markets',   marketsRouter);
app.use('/api/broker',    brokerRouter);
app.use('/api/bot',       botRouter);
app.use('/api/ai',        aiRouter);
app.use('/api/simulator', simulatorRouter);

// ─── Background screener refresh ─────────────────────────────────────────────
// Uses the full aggregator chain: Yahoo → Stooq → CoinGecko → FMP → Mock
// NEVER overwrites cache with an empty array — only updates when we have data.

async function refreshScreener() {
  console.log('[Screener] Starting background refresh...');
  const items: ScreenerItem[] = [];

  for (const ticker of ALL_TICKERS) {
    try {
      // Small delay between requests to avoid hammering any single source
      await new Promise(r => setTimeout(r, 400));

      const [histResult, quoteResult] = await Promise.all([
        getHistoryAggregated(ticker.symbol, '3mo', '1d'),
        getQuoteAggregated(ticker.symbol),
      ]);

      const bars  = histResult?.bars  ?? [];
      const quote = quoteResult?.data ?? null;

      if (!bars.length || !quote) {
        console.log(`[Screener] No data for ${ticker.symbol} — skipping`);
        continue;
      }

      const indicators   = computeIndicators(bars);
      const recommendation = computeRecommendation(bars, indicators);

      const lastRSI  = [...indicators.rsi].reverse().find(v => !isNaN(v)) ?? 50;
      const lastMACD = [...indicators.macdHistogram].reverse().find(v => !isNaN(v)) ?? 0;
      const lastBB   = [...indicators.bbPercent].reverse().find(v => !isNaN(v)) ?? 0.5;

      items.push({
        symbol:       ticker.symbol,
        shortName:    quote.shortName,
        exchange:     ticker.marketId,
        sector:       ticker.sector,
        quoteType:    quote.quoteType,
        price:        quote.regularMarketPrice,
        change:       quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume:       quote.regularMarketVolume,
        marketCap:    quote.marketCap,
        rsi:          lastRSI,
        macdHistogram: lastMACD,
        bbPercent:    lastBB,
        signal:       recommendation.signal,
        score:        recommendation.score,
        sparkline:    bars.slice(-20).map(b => b.close),
      });
    } catch (err) {
      console.error(`[Screener] Error processing ${ticker.symbol}:`, (err as Error).message);
    }
  }

  if (items.length > 0) {
    cache.set('screener:all', items, 10 * 60);
    console.log(`[Screener] Refresh complete. ${items.length}/${ALL_TICKERS.length} symbols updated.`);
  } else {
    console.log('[Screener] Refresh returned 0 items — keeping existing cache (mock or previous real data).');
  }
}

// ─── Startup: seed with mock data immediately ─────────────────────────────────
const mockScreener = generateMockScreener();
cache.set('screener:all', mockScreener, 24 * 60 * 60); // 24h TTL — real data replaces it
console.log(`[Screener] Seeded with ${mockScreener.length} mock symbols.`);

// First real refresh after 30s, then every 15 min
setTimeout(refreshScreener, 30_000);
setInterval(refreshScreener, 15 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`\n🚀 Bolsa Terminal Backend running on http://localhost:${PORT}`);
  console.log(`   API base: http://localhost:${PORT}/api`);
  console.log(`   Health:   http://localhost:${PORT}/api/health\n`);
});
