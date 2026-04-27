/**
 * Financial Modeling Prep (FMP) — optional free tier
 * Requires FMP_API_KEY env var (free: 250 req/day at financialmodelingprep.com)
 * Covers: US stocks, ETFs, indices, forex, crypto
 */

import { OHLCVBar, QuoteSummary } from '../types/index';

const BASE = 'https://financialmodelingprep.com/api/v3';

export function isFmpAvailable(): boolean {
  return !!process.env.FMP_API_KEY;
}

function key(): string {
  return process.env.FMP_API_KEY!;
}

function periodToDays(period: string): number {
  const map: Record<string, number> = {
    '1d': 2, '5d': 7, '1mo': 32, '3mo': 95, '6mo': 185,
    '1y': 370, '2y': 740, '5y': 1830, '10y': 3660,
  };
  return map[period] ?? 370;
}

function subtractDays(d: Date, days: number): Date {
  return new Date(d.getTime() - days * 86400000);
}

function fmt(d: Date): string {
  return d.toISOString().split('T')[0];
}

// Map Yahoo Finance symbol format to FMP format
function toFmpSymbol(yahooSym: string): string {
  const s = yahooSym.toUpperCase();
  if (s === '^GSPC')  return 'SPY';    // use ETF as proxy
  if (s === '^IXIC')  return 'QQQ';
  if (s === '^DJI')   return 'DIA';
  if (s === '^IBEX')  return 'EWP';    // Spain ETF proxy
  if (s === '^FTSE')  return 'ISF.L';
  if (s.endsWith('=X')) return s.replace('=X', '');  // EURUSD=X → EURUSD
  if (s.endsWith('-USD')) return s.replace('-USD', 'USD'); // BTC-USD → BTCUSD
  return s;
}

export async function getFmpQuote(symbol: string): Promise<QuoteSummary | null> {
  if (!isFmpAvailable()) return null;
  const fmpSym = toFmpSymbol(symbol);

  const res  = await (fetch as any)(
    `${BASE}/quote/${encodeURIComponent(fmpSym)}?apikey=${key()}`,
    { signal: AbortSignal.timeout(8000) }
  );
  const data: any[] = await res.json();
  if (!Array.isArray(data) || !data[0]) return null;

  const q = data[0];
  const price = q.price ?? 0;
  if (!price) return null;

  return {
    symbol,
    shortName:                    q.name ?? symbol,
    exchange:                     q.exchange ?? 'FMP',
    currency:                     q.currency ?? 'USD',
    regularMarketPrice:           price,
    regularMarketChange:          q.change ?? 0,
    regularMarketChangePercent:   q.changesPercentage ?? 0,
    regularMarketVolume:          q.volume ?? 0,
    regularMarketOpen:            q.open ?? price,
    regularMarketDayHigh:         q.dayHigh ?? price,
    regularMarketDayLow:          q.dayLow ?? price,
    regularMarketPreviousClose:   q.previousClose ?? price,
    marketCap:                    q.marketCap ?? 0,
    fiftyTwoWeekHigh:             q.yearHigh ?? 0,
    fiftyTwoWeekLow:              q.yearLow ?? 0,
    averageVolume:                q.avgVolume ?? 0,
    quoteType:                    q.type ?? 'EQUITY',
    marketState:                  'REGULAR',
  };
}

export async function getFmpHistory(symbol: string, period: string): Promise<OHLCVBar[]> {
  if (!isFmpAvailable()) return [];
  const fmpSym = toFmpSymbol(symbol);
  const from   = fmt(subtractDays(new Date(), periodToDays(period)));
  const to     = fmt(new Date());

  const res  = await (fetch as any)(
    `${BASE}/historical-price-full/${encodeURIComponent(fmpSym)}?from=${from}&to=${to}&apikey=${key()}`,
    { signal: AbortSignal.timeout(12000) }
  );
  const data: any = await res.json();
  if (!data?.historical?.length) return [];

  return (data.historical as any[])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(d => ({
      time:   Math.floor(new Date(d.date).getTime() / 1000),
      open:   d.open,
      high:   d.high,
      low:    d.low,
      close:  d.close,
      volume: d.volume ?? 0,
    }));
}
