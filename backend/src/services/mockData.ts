import { QuoteSummary, OHLCVBar, ScreenerItem } from '../types/index';
import { computeIndicators, computeRecommendation } from './technicalAnalysis';

// Generate realistic OHLCV data for demo purposes
function generateBars(basePrice: number, days: number, drift = 0.0002, volatility = 0.015): OHLCVBar[] {
  const bars: OHLCVBar[] = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);
  const DAY = 86400;

  for (let i = days; i >= 0; i--) {
    const date = now - i * DAY;
    // Skip weekends
    const d = new Date(date * 1000);
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const change = drift + (Math.random() - 0.5) * 2 * volatility;
    price = price * (1 + change);
    const high = price * (1 + Math.random() * 0.01);
    const low = price * (1 - Math.random() * 0.01);
    const open = price * (1 + (Math.random() - 0.5) * 0.005);

    bars.push({
      time: date,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(price * 100) / 100,
      volume: Math.floor(Math.random() * 50_000_000 + 10_000_000),
    });
  }
  return bars;
}

const MOCK_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', basePrice: 192, sector: 'Technology', quoteType: 'EQUITY' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', basePrice: 415, sector: 'Technology', quoteType: 'EQUITY' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ', basePrice: 875, sector: 'Technology', quoteType: 'EQUITY' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', basePrice: 165, sector: 'Communication Services', quoteType: 'EQUITY' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', basePrice: 185, sector: 'Consumer Cyclical', quoteType: 'EQUITY' },
  { symbol: 'META', name: 'Meta Platforms', exchange: 'NASDAQ', basePrice: 520, sector: 'Communication Services', quoteType: 'EQUITY' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', basePrice: 195, sector: 'Consumer Cyclical', quoteType: 'EQUITY' },
  { symbol: 'JPM', name: 'JPMorgan Chase', exchange: 'NYSE', basePrice: 195, sector: 'Financial Services', quoteType: 'EQUITY' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', basePrice: 152, sector: 'Healthcare', quoteType: 'EQUITY' },
  { symbol: 'SAN.MC', name: 'Banco Santander', exchange: 'BME', basePrice: 4.8, sector: 'Financial Services', quoteType: 'EQUITY' },
  { symbol: 'BBVA.MC', name: 'BBVA', exchange: 'BME', basePrice: 9.5, sector: 'Financial Services', quoteType: 'EQUITY' },
  { symbol: 'ITX.MC', name: 'Inditex', exchange: 'BME', basePrice: 50, sector: 'Consumer Cyclical', quoteType: 'EQUITY' },
  { symbol: 'IBE.MC', name: 'Iberdrola', exchange: 'BME', basePrice: 14, sector: 'Utilities', quoteType: 'EQUITY' },
  { symbol: 'BTC-USD', name: 'Bitcoin', exchange: 'CRYPTO', basePrice: 68000, sector: 'Cryptocurrency', quoteType: 'CRYPTOCURRENCY' },
  { symbol: 'ETH-USD', name: 'Ethereum', exchange: 'CRYPTO', basePrice: 3400, sector: 'Cryptocurrency', quoteType: 'CRYPTOCURRENCY' },
  { symbol: '^GSPC', name: 'S&P 500', exchange: 'NYSE', basePrice: 5200, sector: undefined, quoteType: 'INDEX' },
  { symbol: '^IXIC', name: 'NASDAQ Composite', exchange: 'NASDAQ', basePrice: 16500, sector: undefined, quoteType: 'INDEX' },
  { symbol: '^IBEX', name: 'IBEX 35', exchange: 'BME', basePrice: 11200, sector: undefined, quoteType: 'INDEX' },
  { symbol: '^FTSE', name: 'FTSE 100', exchange: 'LSE', basePrice: 8100, sector: undefined, quoteType: 'INDEX' },
  { symbol: '^DJI', name: 'Dow Jones', exchange: 'NYSE', basePrice: 38500, sector: undefined, quoteType: 'INDEX' },
];

const barsCache = new Map<string, OHLCVBar[]>();

function getBarsForSymbol(stock: typeof MOCK_STOCKS[0]): OHLCVBar[] {
  if (!barsCache.has(stock.symbol)) {
    barsCache.set(stock.symbol, generateBars(stock.basePrice, 3650));
  }
  return barsCache.get(stock.symbol)!;
}

export function getMockQuote(symbol: string): QuoteSummary | null {
  const stock = MOCK_STOCKS.find((s) => s.symbol === symbol);
  if (!stock) return null;

  const bars = getBarsForSymbol(stock);
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  const change = last.close - prev.close;
  const changePct = (change / prev.close) * 100;

  return {
    symbol: stock.symbol,
    shortName: stock.name,
    exchange: stock.exchange,
    currency: stock.exchange === 'BME' ? 'EUR' : stock.exchange === 'LSE' ? 'GBP' : 'USD',
    regularMarketPrice: last.close,
    regularMarketChange: change,
    regularMarketChangePercent: changePct,
    regularMarketVolume: last.volume,
    regularMarketOpen: last.open,
    regularMarketDayHigh: last.high,
    regularMarketDayLow: last.low,
    regularMarketPreviousClose: prev.close,
    fiftyTwoWeekHigh: Math.max(...bars.slice(-252).map((b) => b.high)),
    fiftyTwoWeekLow: Math.min(...bars.slice(-252).map((b) => b.low)),
    marketCap: last.close * 1e10,
    trailingPE: 25 + Math.random() * 15,
    beta: 0.8 + Math.random() * 0.8,
    quoteType: stock.quoteType,
    marketState: 'REGULAR',
    sector: stock.sector,
  };
}

export function getMockHistory(symbol: string, period: string): OHLCVBar[] {
  const stock = MOCK_STOCKS.find((s) => s.symbol === symbol);
  if (!stock) return generateBars(100, 365);

  const allBars = getBarsForSymbol(stock);

  const daysMap: Record<string, number> = {
    '1mo': 22, '3mo': 66, '6mo': 132, '1y': 252, '2y': 504, '5y': 1260, '10y': 2520,
  };
  const days = daysMap[period] ?? 252;
  return allBars.slice(-days);
}

export function generateMockScreener(): ScreenerItem[] {
  return MOCK_STOCKS.filter((s) => s.sector).map((stock) => {
    const bars = getBarsForSymbol(stock);
    const recentBars = bars.slice(-90);
    const indicators = computeIndicators(recentBars);
    const recommendation = computeRecommendation(recentBars, indicators);
    const last = recentBars[recentBars.length - 1];
    const prev = recentBars[recentBars.length - 2];
    const rsi = [...indicators.rsi].reverse().find((v) => !isNaN(v)) ?? 50;
    const macd = [...indicators.macdHistogram].reverse().find((v) => !isNaN(v)) ?? 0;
    const bb = [...indicators.bbPercent].reverse().find((v) => !isNaN(v)) ?? 0.5;

    return {
      symbol: stock.symbol,
      shortName: stock.name,
      exchange: stock.exchange,
      sector: stock.sector,
      quoteType: stock.quoteType,
      price: last.close,
      change: last.close - prev.close,
      changePercent: ((last.close - prev.close) / prev.close) * 100,
      volume: last.volume,
      marketCap: last.close * 1e10,
      rsi,
      macdHistogram: macd,
      bbPercent: bb,
      signal: recommendation.signal,
      score: recommendation.score,
      sparkline: recentBars.slice(-20).map((b) => b.close),
    };
  });
}

export const MOCK_SYMBOLS = MOCK_STOCKS.map((s) => s.symbol);
