export interface OHLCVBar {
  time: number; // Unix timestamp seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface QuoteSummary {
  symbol: string;
  shortName: string;
  longName?: string;
  exchange: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketPreviousClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap?: number;
  trailingPE?: number;
  forwardPE?: number;
  dividendYield?: number;
  beta?: number;
  averageVolume?: number;
  sector?: string;
  industry?: string;
  quoteType: string;
  marketState: string;
}

export interface IndicatorSet {
  rsi: number[];
  macdLine: number[];
  macdSignal: number[];
  macdHistogram: number[];
  sma20: number[];
  sma50: number[];
  ema20: number[];
  ema200: number[];
  bbUpper: number[];
  bbMiddle: number[];
  bbLower: number[];
  bbPercent: number[];
  volumeMA20: number[];
}

export type SignalType = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface SignalComponent {
  name: string;
  value: number;
  signal: string;
  score: number;
}

export interface Recommendation {
  signal: SignalType;
  score: number;
  components: SignalComponent[];
  currentRSI: number;
  currentMACD: number;
  currentBBPercent: number;
  priceVsEMA200: number; // percentage above/below
}

export interface HistoryResponse {
  symbol: string;
  bars: OHLCVBar[];
  indicators: IndicatorSet;
  recommendation: Recommendation;
}

export interface SearchResult {
  symbol: string;
  shortname: string;
  longname?: string;
  exchange: string;
  quoteType: string;
}

export interface ScreenerItem {
  symbol: string;
  shortName: string;
  exchange: string;
  sector?: string;
  quoteType: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  rsi: number;
  macdHistogram: number;
  bbPercent: number;
  signal: SignalType;
  score: number;
  sparkline: number[]; // last 20 closes
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  marketId: string;
}
