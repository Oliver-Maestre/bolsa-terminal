/**
 * Eulerpool — free financial data API (100,000 req/month, no credit card)
 * Requires EULERPOOL_API_KEY env var (free key at eulerpool.com/developers/register)
 * Covers: 90+ exchanges incl. BME/Madrid, ISIN or ticker lookups
 *
 * Stock candles are daily EOD data approximated from closing quotes —
 * open/high/low are frequently equal to close (no true intrabar range), so
 * candlestick charts look flatter than a real OHLC source. Still real market
 * prices, not mock.
 *
 * The /equity/* endpoints only cover individual stocks — ETFs 404 there and
 * need the separate /etf/* endpoints instead (different response shapes:
 * etf/profile has no candles, etf/quotes returns [timestamp, price] pairs).
 */

import { OHLCVBar, QuoteSummary } from '../types/index';

const BASE = 'https://api.eulerpool.com/api/1';

export function isEulerpoolAvailable(): boolean {
  return !!process.env.EULERPOOL_API_KEY;
}

function key(): string {
  return process.env.EULERPOOL_API_KEY!;
}

// Non-equity index symbols aren't individually listed securities — proxy with
// a liquid US-listed ETF that tracks them (same approach as fmp.ts). These
// all route through the /etf/* endpoints, not /equity/*.
const INDEX_PROXY: Record<string, string> = {
  '^GSPC': 'SPY',
  '^IXIC': 'QQQ',
  '^NDX':  'QQQ',
  '^DJI':  'DIA',
  '^IBEX': 'EWP',
};
const ETF_TICKERS = new Set(Object.values(INDEX_PROXY));

function toEulerpoolSymbol(yahooSym: string): string {
  const s = yahooSym.toUpperCase();
  return INDEX_PROXY[s] ?? s;
}

function periodToRange(period: string): string {
  const map: Record<string, string> = {
    '1d': '1m', '5d': '1m', '1mo': '1m', '3mo': '3m', '6mo': '6m',
    '1y': '1y', '2y': '2y', '5y': '5y', '10y': 'max',
  };
  return map[period] ?? '1y';
}

function periodToDays(period: string): number {
  const map: Record<string, number> = {
    '1d': 2, '5d': 7, '1mo': 32, '3mo': 95, '6mo': 185,
    '1y': 370, '2y': 740, '5y': 1830, '10y': 3660,
  };
  return map[period] ?? 370;
}

// Symbol → ISIN cache, populated on demand via the search endpoint when a
// direct ticker lookup 404s (e.g. exchange-suffixed symbols like SAN.MC that
// don't match Eulerpool's own ticker convention for that listing). Stocks only
// — ETF proxies never need this, they're hardcoded tickers we already verified.
const isinCache = new Map<string, string | null>();

async function resolveStockIsin(symbol: string): Promise<string | null> {
  if (isinCache.has(symbol)) return isinCache.get(symbol)!;

  const base = symbol.split('.')[0];
  try {
    const res = await (fetch as any)(
      `${BASE}/equity/search?q=${encodeURIComponent(base)}&token=${key()}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data: any = await res.json();
    const results: any[] = data?.results ?? [];
    const match =
      results.find(r => r.type === 'stock' && r.ticker?.toUpperCase() === symbol.toUpperCase()) ??
      results.find(r => r.type === 'stock' && r.ticker?.toUpperCase().startsWith(base.toUpperCase())) ??
      results.find(r => r.type === 'stock') ??
      null;

    const isin = match?.isin ?? null;
    isinCache.set(symbol, isin);
    return isin;
  } catch {
    isinCache.set(symbol, null);
    return null;
  }
}

async function fetchStockOverview(identifier: string): Promise<any | null> {
  const res = await (fetch as any)(
    `${BASE}/equity/overview/${encodeURIComponent(identifier)}?token=${key()}`,
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) return null;
  const data: any = await res.json();
  return data?.price ? data : null;
}

async function fetchStockCandles(identifier: string, range: string): Promise<any[]> {
  const res = await (fetch as any)(
    `${BASE}/equity/candles/${encodeURIComponent(identifier)}?range=${range}&token=${key()}`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) return [];
  const data: any = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchEtfProfile(ticker: string): Promise<any | null> {
  const res = await (fetch as any)(
    `${BASE}/etf/profile/${encodeURIComponent(ticker)}?token=${key()}`,
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) return null;
  const data: any = await res.json();
  return data?.latestQuotes ? data : null;
}

// Ignores startdate/enddate server-side (returns full history regardless) —
// filter client-side by period instead.
async function fetchEtfQuotes(ticker: string): Promise<[number, number][]> {
  const res = await (fetch as any)(
    `${BASE}/etf/quotes/${encodeURIComponent(ticker)}?token=${key()}`,
    { signal: AbortSignal.timeout(12000) }
  );
  if (!res.ok) return [];
  const data: any = await res.json();
  return Array.isArray(data) ? data : [];
}

async function getEtfQuote(symbol: string, ticker: string): Promise<QuoteSummary | null> {
  const profile = await fetchEtfProfile(ticker);
  if (!profile) return null;

  const price = profile.latestQuotes;
  const points = await fetchEtfQuotes(ticker);
  const cutoff = Date.now() - 5 * 86400000;
  const recent = points.filter(([t]) => t >= cutoff);
  const prevClose = recent.length >= 2 ? recent[recent.length - 2][1] : price;

  return {
    symbol,
    shortName:                    profile.name ?? symbol,
    exchange:                     'EULERPOOL',
    currency:                     profile.currency ?? 'USD',
    regularMarketPrice:           price,
    regularMarketChange:          price - prevClose,
    regularMarketChangePercent:   prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
    regularMarketVolume:          0,
    regularMarketOpen:            price,
    regularMarketDayHigh:         price,
    regularMarketDayLow:          price,
    regularMarketPreviousClose:   prevClose,
    marketCap:                    profile.aum ?? 0,
    fiftyTwoWeekHigh:             0,
    fiftyTwoWeekLow:              0,
    averageVolume:                0,
    dividendYield:                profile.dividendYield || undefined,
    quoteType:                    'ETF',
    marketState:                  'REGULAR',
  };
}

async function getEtfHistory(ticker: string, period: string): Promise<OHLCVBar[]> {
  const points = await fetchEtfQuotes(ticker);
  const cutoff = Date.now() - periodToDays(period) * 86400000;
  return points
    .filter(([t]) => t >= cutoff)
    .map(([t, price]) => ({
      time:   Math.floor(t / 1000),
      open:   price,
      high:   price,
      low:    price,
      close:  price,
      volume: 0,
    }));
}

// Overview gives the current price + fundamentals but not change/OHLC — those
// are derived from the last two daily candles.
export async function getEulerpoolQuote(symbol: string): Promise<QuoteSummary | null> {
  if (!isEulerpoolAvailable()) return null;
  const epSym = toEulerpoolSymbol(symbol);

  if (ETF_TICKERS.has(epSym)) return getEtfQuote(symbol, epSym);

  let identifier = epSym;
  let overview = await fetchStockOverview(identifier);
  let candles = overview ? await fetchStockCandles(identifier, '1m') : [];

  if (!overview) {
    const isin = await resolveStockIsin(epSym);
    if (!isin) return null;
    identifier = isin;
    overview = await fetchStockOverview(identifier);
    if (!overview) return null;
    candles = await fetchStockCandles(identifier, '1m');
  }

  const price = overview.price;
  if (!price) return null;

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const prevClose = prev?.close ?? last?.close ?? price;

  return {
    symbol,
    shortName:                    overview.name ?? symbol,
    exchange:                     'EULERPOOL',
    currency:                     overview.currency ?? 'USD',
    regularMarketPrice:           price,
    regularMarketChange:          price - prevClose,
    regularMarketChangePercent:   prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
    regularMarketVolume:          0,
    regularMarketOpen:            last?.open ?? price,
    regularMarketDayHigh:         last?.high ?? price,
    regularMarketDayLow:          last?.low ?? price,
    regularMarketPreviousClose:   prevClose,
    marketCap:                    overview.marketCap ?? 0,
    fiftyTwoWeekHigh:             overview.week52High ?? 0,
    fiftyTwoWeekLow:              overview.week52Low ?? 0,
    averageVolume:                0,
    trailingPE:                   overview.pe || undefined,
    dividendYield:                overview.dividendYield || undefined,
    sector:                       overview.sector || undefined,
    industry:                     overview.industry || undefined,
    quoteType:                    'EQUITY',
    marketState:                  'REGULAR',
  };
}

export async function getEulerpoolHistory(symbol: string, period: string): Promise<OHLCVBar[]> {
  if (!isEulerpoolAvailable()) return [];
  const epSym = toEulerpoolSymbol(symbol);

  if (ETF_TICKERS.has(epSym)) return getEtfHistory(epSym, period);

  const range = periodToRange(period);
  let identifier = epSym;
  let candles = await fetchStockCandles(identifier, range);

  if (!candles.length) {
    const isin = await resolveStockIsin(epSym);
    if (!isin) return [];
    identifier = isin;
    candles = await fetchStockCandles(identifier, range);
  }

  return candles
    .filter(c => typeof c.close === 'number')
    .map(c => ({
      time:   Math.floor(c.timestamp / 1000),
      open:   c.open ?? c.close,
      high:   c.high ?? c.close,
      low:    c.low ?? c.close,
      close:  c.close,
      volume: c.volume ?? 0,
    }));
}
