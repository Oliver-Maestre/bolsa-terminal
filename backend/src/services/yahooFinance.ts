import yf from 'yahoo-finance2';
const yahooFinance = (yf as any).default ?? yf;
import * as cache from './cache';
import { OHLCVBar, QuoteSummary, SearchResult } from '../types/index';

// Suppress yahoo-finance2 validation errors for missing fields
try { yahooFinance.setGlobalConfig?.({ validation: { logErrors: false } }); } catch (_) { /* ignore */ }

// Retry wrapper for rate-limited requests
async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelay = 2000): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = (err as Error).message ?? '';
      const isRateLimit = msg.includes('Too Many Requests') || msg.includes('429');
      if (isRateLimit && attempt < retries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[Yahoo] Rate limited, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

function safeNum(val: unknown): number | undefined {
  if (typeof val === 'number' && isFinite(val)) return val;
  return undefined;
}

export async function getQuote(symbol: string): Promise<QuoteSummary | null> {
  const cacheKey = `quote:${symbol}`;
  const cached = cache.get<QuoteSummary>(cacheKey);
  if (cached) return cached;

  try {
    const result: any = await withRetry(() => yahooFinance.quote(symbol));
    if (!result) return null;

    const q: QuoteSummary = {
      symbol: result.symbol ?? symbol,
      shortName: result.shortName ?? result.symbol ?? symbol,
      longName: result.longName ?? undefined,
      exchange: result.fullExchangeName ?? result.exchange ?? '',
      currency: result.currency ?? 'USD',
      regularMarketPrice: result.regularMarketPrice ?? 0,
      regularMarketChange: result.regularMarketChange ?? 0,
      regularMarketChangePercent: result.regularMarketChangePercent ?? 0,
      regularMarketVolume: result.regularMarketVolume ?? 0,
      regularMarketOpen: safeNum(result.regularMarketOpen),
      regularMarketDayHigh: safeNum(result.regularMarketDayHigh),
      regularMarketDayLow: safeNum(result.regularMarketDayLow),
      regularMarketPreviousClose: safeNum(result.regularMarketPreviousClose),
      fiftyTwoWeekHigh: safeNum(result.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: safeNum(result.fiftyTwoWeekLow),
      marketCap: safeNum(result.marketCap),
      trailingPE: safeNum(result.trailingPE),
      forwardPE: safeNum(result.forwardPE),
      dividendYield: safeNum(result.trailingAnnualDividendYield),
      beta: safeNum(result.beta),
      averageVolume: safeNum(result.averageDailyVolume10Day),
      sector: undefined,
      industry: undefined,
      quoteType: result.quoteType ?? 'EQUITY',
      marketState: result.marketState ?? 'CLOSED',
    };

    cache.set(cacheKey, q, 15); // 15s TTL for live quotes
    return q;
  } catch (err) {
    console.error(`[Yahoo] getQuote(${symbol}) failed:`, (err as Error).message);
    return null;
  }
}

export async function getBatchQuotes(symbols: string[]): Promise<(QuoteSummary | null)[]> {
  return Promise.all(symbols.map(getQuote));
}

type HistoryInterval = '1d' | '1wk' | '1mo';

export async function getHistory(symbol: string, period = '10y', interval: HistoryInterval = '1d'): Promise<OHLCVBar[]> {
  const cacheKey = `history:${symbol}:${period}:${interval}`;
  const cached = cache.get<OHLCVBar[]>(cacheKey);
  if (cached) return cached;

  try {
    const period2 = new Date();
    const period1 = new Date();

    const periodMap: Record<string, () => void> = {
      '1mo': () => period1.setMonth(period1.getMonth() - 1),
      '3mo': () => period1.setMonth(period1.getMonth() - 3),
      '6mo': () => period1.setMonth(period1.getMonth() - 6),
      '1y': () => period1.setFullYear(period1.getFullYear() - 1),
      '2y': () => period1.setFullYear(period1.getFullYear() - 2),
      '5y': () => period1.setFullYear(period1.getFullYear() - 5),
      '10y': () => period1.setFullYear(period1.getFullYear() - 10),
      'max': () => period1.setFullYear(2000),
    };

    (periodMap[period] ?? periodMap['10y'])();

    const raw: any[] = await withRetry(() => yahooFinance.historical(symbol, {
      period1: period1.toISOString().split('T')[0],
      period2: period2.toISOString().split('T')[0],
      interval,
    }));

    const bars: OHLCVBar[] = raw
      .filter((b: any) => b.open && b.high && b.low && b.close)
      .map((b: any) => ({
        time: Math.floor(new Date(b.date).getTime() / 1000),
        open: b.open!,
        high: b.high!,
        low: b.low!,
        close: b.close!,
        volume: b.volume ?? 0,
      }));

    // 4h TTL for historical data
    cache.set(cacheKey, bars, 4 * 3600);
    return bars;
  } catch (err) {
    console.error(`[Yahoo] getHistory(${symbol}) failed:`, (err as Error).message);
    return [];
  }
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = cache.get<SearchResult[]>(cacheKey);
  if (cached) return cached;

  try {
    const results = await yahooFinance.search(query);
    const items: SearchResult[] = (results.quotes ?? [])
      .filter((r: any) => r.symbol && (r.quoteType === 'EQUITY' || r.quoteType === 'ETF' || r.quoteType === 'CRYPTOCURRENCY' || r.quoteType === 'INDEX'))
      .slice(0, 10)
      .map((r: any) => ({
        symbol: r.symbol,
        shortname: (r as any).shortname ?? r.symbol!,
        longname: (r as any).longname ?? undefined,
        exchange: (r as any).exchDisp ?? '',
        quoteType: r.quoteType ?? 'EQUITY',
      }));

    cache.set(cacheKey, items, 300); // 5min TTL for search results
    return items;
  } catch (err) {
    console.error(`[Yahoo] search(${query}) failed:`, (err as Error).message);
    return [];
  }
}
