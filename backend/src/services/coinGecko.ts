/**
 * CoinGecko free API — no API key required, ~30 req/min limit
 * Used as primary/fallback source for crypto symbols
 */

import { OHLCVBar, QuoteSummary } from '../types/index';

const BASE = 'https://api.coingecko.com/api/v3';

// Map our symbols to CoinGecko coin IDs
const CG_MAP: Record<string, string> = {
  'BTC-USD':   'bitcoin',
  'ETH-USD':   'ethereum',
  'SOL-USD':   'solana',
  'BNB-USD':   'binancecoin',
  'XRP-USD':   'ripple',
  'ADA-USD':   'cardano',
  'DOGE-USD':  'dogecoin',
  'AVAX-USD':  'avalanche-2',
  'MATIC-USD': 'matic-network',
  'LINK-USD':  'chainlink',
  'DOT-USD':   'polkadot',
  'UNI-USD':   'uniswap',
};

export function isCryptoSymbol(symbol: string): boolean {
  return symbol in CG_MAP;
}

async function cgFetch(path: string): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${path}`);
  return res.json();
}

export async function getCGQuote(symbol: string): Promise<QuoteSummary | null> {
  const id = CG_MAP[symbol.toUpperCase()];
  if (!id) return null;
  try {
    const data = await cgFetch(
      `/coins/markets?vs_currency=usd&ids=${id}&price_change_percentage=24h`
    );
    if (!data?.length) return null;
    const c = data[0];
    return {
      symbol,
      shortName: c.name,
      longName: c.name,
      exchange: 'CRYPTO',
      currency: 'USD',
      regularMarketPrice: c.current_price ?? 0,
      regularMarketChange: c.price_change_24h ?? 0,
      regularMarketChangePercent: c.price_change_percentage_24h ?? 0,
      regularMarketVolume: c.total_volume ?? 0,
      regularMarketDayHigh: c.high_24h,
      regularMarketDayLow: c.low_24h,
      marketCap: c.market_cap,
      quoteType: 'CRYPTOCURRENCY',
      marketState: 'REGULAR', // crypto never closes
    };
  } catch (err) {
    console.error(`[CoinGecko] getCGQuote(${symbol}) failed:`, (err as Error).message);
    return null;
  }
}

export async function getCGHistory(symbol: string, period: string): Promise<OHLCVBar[]> {
  const id = CG_MAP[symbol.toUpperCase()];
  if (!id) return [];

  const days = periodToDays(period);
  try {
    // CoinGecko OHLC endpoint (candles)
    const data = await cgFetch(`/coins/${id}/ohlc?vs_currency=usd&days=${days}`);
    if (!Array.isArray(data)) return [];
    // data: [[timestamp_ms, open, high, low, close], ...]
    return data.map(([ts, o, h, l, c]: number[]) => ({
      time: Math.floor(ts / 1000),
      open: o,
      high: h,
      low: l,
      close: c,
      volume: 0, // OHLC endpoint doesn't include volume
    }));
  } catch {
    // Fallback: use market_chart (no true candles, only close + volume)
    try {
      const mc = await cgFetch(`/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=daily`);
      const prices: [number, number][] = mc.prices ?? [];
      const volumes: [number, number][] = mc.total_volumes ?? [];
      return prices.map(([ts, close], i) => ({
        time: Math.floor(ts / 1000),
        open: close,
        high: close * 1.005,
        low: close * 0.995,
        close,
        volume: volumes[i]?.[1] ?? 0,
      }));
    } catch (err2) {
      console.error(`[CoinGecko] getCGHistory(${symbol}) failed:`, (err2 as Error).message);
      return [];
    }
  }
}

function periodToDays(period: string): number {
  const map: Record<string, number> = {
    '1d': 1, '5d': 5, '1mo': 30, '3mo': 90,
    '6mo': 180, '1y': 365, '2y': 730, '5y': 1825, '10y': 3650,
  };
  return map[period] ?? 365;
}
