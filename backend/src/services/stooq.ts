/**
 * Stooq data source — no API key required
 * https://stooq.com
 * Covers: US stocks, European stocks, indices, forex, crypto
 */

import { OHLCVBar, QuoteSummary } from '../types/index';

const BASE_QUOTE   = 'https://stooq.com/q/l/';
const BASE_HISTORY = 'https://stooq.com/q/d/l/';

// ── Symbol mapping: Yahoo Finance → Stooq ────────────────────────────────────
export function toStooqSymbol(yahooSym: string): string {
  const s = yahooSym.toUpperCase().trim();

  // Explicit index map
  const INDEX_MAP: Record<string, string> = {
    '^GSPC': '^SPX',  '^IXIC': '^NDX',  '^DJI': '^DJI',
    '^IBEX': 'IBEX.IN', '^FTSE': '^FTM', '^NDX': '^NDX',
    '^CAC':  '^CAC',  '^DAX':  '^DAX',  '^N225': '^NKX',
    'IBEX':  'IBEX.IN',
  };
  if (INDEX_MAP[s]) return INDEX_MAP[s];

  // Forex: EURUSD=X → eurusd
  if (s.endsWith('=X')) return s.replace('=X', '').toLowerCase();

  // Crypto: BTC-USD → btc.v
  if (s.endsWith('-USD') && !s.startsWith('^')) {
    return `${s.replace('-USD', '')}.V`.toLowerCase();
  }

  // Already has exchange suffix (e.g. SAN.MC) → lowercase as-is
  if (s.includes('.')) return s.toLowerCase();

  // US stock default
  return `${s}.US`.toLowerCase();
}

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0].replace(/-/g, '');
}

function periodToDays(period: string): number {
  const map: Record<string, number> = {
    '1d': 2, '5d': 7, '1mo': 32, '3mo': 95, '6mo': 185,
    '1y': 370, '2y': 740, '5y': 1830, '10y': 3660,
  };
  return map[period] ?? 370;
}

// ── Quote ─────────────────────────────────────────────────────────────────────
export async function getStooqQuote(symbol: string): Promise<QuoteSummary | null> {
  const stSym = toStooqSymbol(symbol);
  const url   = `${BASE_QUOTE}?s=${encodeURIComponent(stSym)}&f=sd2t2ohlcv&h&e=csv`;

  const res  = await (fetch as any)(url, { signal: AbortSignal.timeout(8000) });
  const text = await res.text();
  const lines = text.trim().split('\n');

  if (lines.length < 2) return null;

  const cols = lines[1].split(',');
  // header: Symbol,Date,Time,Open,High,Low,Close,Volume
  if (cols.length < 7) return null;

  const [, , , openStr, highStr, lowStr, closeStr, volStr] = cols;
  if (!closeStr || closeStr.trim() === 'N/D') return null;

  const price = parseFloat(closeStr);
  const open  = parseFloat(openStr);
  if (isNaN(price) || price <= 0) return null;

  const isCrypto  = symbol.endsWith('-USD');
  const isEuro    = symbol.toUpperCase().includes('.MC') || symbol.toUpperCase().includes('.L');
  const currency  = isCrypto ? 'USD' : isEuro ? 'EUR' : 'USD';

  return {
    symbol,
    shortName:                    symbol,
    exchange:                     'STOOQ',
    currency,
    regularMarketPrice:           price,
    regularMarketChange:          price - open,
    regularMarketChangePercent:   open ? ((price - open) / open) * 100 : 0,
    regularMarketVolume:          parseInt(volStr) || 0,
    regularMarketOpen:            open,
    regularMarketDayHigh:         parseFloat(highStr),
    regularMarketDayLow:          parseFloat(lowStr),
    regularMarketPreviousClose:   open,
    marketCap:                    0,
    fiftyTwoWeekHigh:             0,
    fiftyTwoWeekLow:              0,
    averageVolume:                0,
    quoteType:                    isCrypto ? 'CRYPTOCURRENCY' : 'EQUITY',
    marketState:                  'REGULAR',
  };
}

// ── History ───────────────────────────────────────────────────────────────────
export async function getStooqHistory(symbol: string, period: string): Promise<OHLCVBar[]> {
  const stSym = toStooqSymbol(symbol);
  const now   = new Date();
  const d2    = fmtDate(now);
  const d1    = fmtDate(new Date(now.getTime() - periodToDays(period) * 86400000));

  const url = `${BASE_HISTORY}?s=${encodeURIComponent(stSym)}&d1=${d1}&d2=${d2}&i=d`;

  const res  = await (fetch as any)(url, { signal: AbortSignal.timeout(10000) });
  const text = await res.text();
  const lines = text.trim().split('\n');

  if (lines.length < 2) return [];

  const bars: OHLCVBar[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [date, open, high, low, close, volume] = lines[i].split(',');
    if (!close || close.trim() === 'N/D') continue;
    const c = parseFloat(close);
    if (isNaN(c) || c <= 0) continue;
    bars.push({
      time:   Math.floor(new Date(date.trim()).getTime() / 1000),
      open:   parseFloat(open),
      high:   parseFloat(high),
      low:    parseFloat(low),
      close:  c,
      volume: parseInt(volume) || 0,
    });
  }

  return bars;
}
