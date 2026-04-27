/**
 * Multi-source data aggregator
 *
 * Quote priority:  Yahoo → CoinGecko (crypto) → Stooq → FMP → AlphaVantage → Mock
 * History priority: Yahoo → Stooq → CoinGecko (crypto) → FMP → AlphaVantage → Mock
 *
 * Stooq requires no API key and covers US + European stocks + indices + forex.
 * FMP requires FMP_API_KEY (free: 250 req/day at financialmodelingprep.com).
 */

import { getQuote as yfQuote, getHistory as yfHistory }   from './yahooFinance';
import { getCGQuote, getCGHistory, isCryptoSymbol }        from './coinGecko';
import { getAVQuote, getAVHistory, isAvAvailable }         from './alphaVantage';
import { getStooqQuote, getStooqHistory }                  from './stooq';
import { getFmpQuote, getFmpHistory, isFmpAvailable }      from './fmp';
import { getMockQuote, getMockHistory }                    from './mockData';
import { OHLCVBar, QuoteSummary }                          from '../types/index';
import * as cache                                          from './cache';

// ── QUOTE ─────────────────────────────────────────────────────────────────────
export async function getQuoteAggregated(
  symbol: string
): Promise<{ data: QuoteSummary; source: string } | null> {
  const sym      = symbol.toUpperCase();
  const cacheKey = `quote:${sym}`;
  const cached   = cache.get<{ data: QuoteSummary; source: string }>(cacheKey);
  if (cached) return cached;

  const trySource = async (
    fn: () => Promise<QuoteSummary | null>,
    src: string,
    ttl = 15
  ): Promise<{ data: QuoteSummary; source: string } | null> => {
    try {
      const q = await fn();
      if (q && q.regularMarketPrice > 0) {
        const result = { data: q, source: src };
        cache.set(cacheKey, result, ttl);
        return result;
      }
    } catch { /* fall through */ }
    return null;
  };

  // 1. Yahoo Finance
  const yahoo = await trySource(() => yfQuote(sym), 'yahoo', 15);
  if (yahoo) return yahoo;

  // 2a. CoinGecko for crypto symbols
  if (isCryptoSymbol(sym)) {
    const cg = await trySource(() => getCGQuote(sym), 'coingecko', 30);
    if (cg) return cg;
  }

  // 2b. Stooq (no API key — works for stocks, indices, forex)
  const stooq = await trySource(() => getStooqQuote(sym), 'stooq', 20);
  if (stooq) return stooq;

  // 3. Financial Modeling Prep (optional key)
  if (isFmpAvailable()) {
    const fmp = await trySource(() => getFmpQuote(sym), 'fmp', 20);
    if (fmp) return fmp;
  }

  // 4. Alpha Vantage (optional key, stocks only)
  if (!isCryptoSymbol(sym) && isAvAvailable()) {
    const av = await trySource(() => getAVQuote(sym), 'alphavantage', 60);
    if (av) return av;
  }

  // 5. Mock fallback
  const mock = getMockQuote(sym);
  if (mock) {
    const result = { data: { ...mock, _demo: true } as any, source: 'mock' };
    cache.set(cacheKey, result, 30);
    return result;
  }

  return null;
}

// ── HISTORY ───────────────────────────────────────────────────────────────────
export async function getHistoryAggregated(
  symbol: string, period: string, interval: string
): Promise<{ bars: OHLCVBar[]; source: string }> {
  const sym      = symbol.toUpperCase();
  const cacheKey = `hist:${sym}:${period}:${interval}`;
  const cached   = cache.get<{ bars: OHLCVBar[]; source: string }>(cacheKey);
  if (cached) return cached;

  const MIN_BARS = 5;
  const CACHE_TTL = 4 * 3600;

  const tryHistory = async (
    fn: () => Promise<OHLCVBar[]>,
    src: string
  ): Promise<{ bars: OHLCVBar[]; source: string } | null> => {
    try {
      const bars = await fn();
      if (bars && bars.length > MIN_BARS) {
        const result = { bars, source: src };
        cache.set(cacheKey, result, CACHE_TTL);
        return result;
      }
    } catch { /* fall through */ }
    return null;
  };

  // 1. Yahoo Finance
  const yahoo = await tryHistory(
    () => yfHistory(sym, period, interval as any),
    'yahoo'
  );
  if (yahoo) return yahoo;

  // 2. Stooq (no API key, good coverage for daily bars)
  const stooq = await tryHistory(() => getStooqHistory(sym, period), 'stooq');
  if (stooq) return stooq;

  // 3a. CoinGecko for crypto
  if (isCryptoSymbol(sym)) {
    const cg = await tryHistory(() => getCGHistory(sym, period), 'coingecko');
    if (cg) return cg;
  }

  // 3b. Financial Modeling Prep
  if (isFmpAvailable()) {
    const fmp = await tryHistory(() => getFmpHistory(sym, period), 'fmp');
    if (fmp) return fmp;
  }

  // 4. Alpha Vantage
  if (!isCryptoSymbol(sym) && isAvAvailable()) {
    const allBars = await getFmpHistory(sym, '10y').catch(() => [] as OHLCVBar[]);
    if (allBars.length > MIN_BARS) {
      const bars   = filterByPeriod(allBars, period);
      const result = { bars, source: 'alphavantage' };
      cache.set(cacheKey, result, CACHE_TTL);
      return result;
    }
  }

  // 5. Mock fallback
  const mockBars = getMockHistory(sym, period);
  return { bars: mockBars, source: 'mock' };
}

function filterByPeriod(bars: OHLCVBar[], period: string): OHLCVBar[] {
  const now = Date.now() / 1000;
  const periodMap: Record<string, number> = {
    '1d': 1, '5d': 5, '1mo': 30, '3mo': 90,
    '6mo': 180, '1y': 365, '2y': 730, '5y': 1825, '10y': 3650,
  };
  const days   = periodMap[period] ?? 365;
  const cutoff = now - days * 86400;
  return bars.filter(b => b.time >= cutoff);
}
