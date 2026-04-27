/**
 * Alpha Vantage — free tier: 25 req/day
 * Set ALPHA_VANTAGE_KEY in .env to enable.
 * Used as secondary fallback for stock symbols.
 */

import { OHLCVBar, QuoteSummary } from '../types/index';

const API_KEY = process.env.ALPHA_VANTAGE_KEY ?? '';
const BASE    = 'https://www.alphavantage.co/query';

export function isAvAvailable(): boolean {
  return API_KEY.length > 0;
}

async function avFetch(params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams({ ...params, apikey: API_KEY }).toString();
  const res = await fetch(`${BASE}?${qs}`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`AlphaVantage HTTP ${res.status}`);
  return res.json();
}

export async function getAVQuote(symbol: string): Promise<QuoteSummary | null> {
  if (!isAvAvailable()) return null;
  try {
    const data = await avFetch({ function: 'GLOBAL_QUOTE', symbol });
    const q = data['Global Quote'];
    if (!q || !q['05. price']) return null;
    const price   = parseFloat(q['05. price']);
    const change  = parseFloat(q['09. change']);
    const changePct = parseFloat(q['10. change percent'].replace('%', ''));
    const vol     = parseInt(q['06. volume'], 10);
    const prevClose = parseFloat(q['08. previous close']);
    return {
      symbol,
      shortName: symbol,
      exchange: 'US',
      currency: 'USD',
      regularMarketPrice: price,
      regularMarketChange: change,
      regularMarketChangePercent: changePct,
      regularMarketVolume: vol,
      regularMarketPreviousClose: prevClose,
      quoteType: 'EQUITY',
      marketState: 'REGULAR',
    };
  } catch (err) {
    console.error(`[AlphaVantage] getAVQuote(${symbol}) failed:`, (err as Error).message);
    return null;
  }
}

export async function getAVHistory(symbol: string): Promise<OHLCVBar[]> {
  if (!isAvAvailable()) return [];
  try {
    const data = await avFetch({
      function: 'TIME_SERIES_DAILY_ADJUSTED',
      symbol,
      outputsize: 'full',
    });
    const series = data['Time Series (Daily)'];
    if (!series) return [];
    return Object.entries(series)
      .map(([date, v]: [string, any]) => ({
        time: Math.floor(new Date(date).getTime() / 1000),
        open:   parseFloat(v['1. open']),
        high:   parseFloat(v['2. high']),
        low:    parseFloat(v['3. low']),
        close:  parseFloat(v['5. adjusted close']),
        volume: parseInt(v['6. volume'], 10),
      }))
      .sort((a, b) => a.time - b.time);
  } catch (err) {
    console.error(`[AlphaVantage] getAVHistory(${symbol}) failed:`, (err as Error).message);
    return [];
  }
}
