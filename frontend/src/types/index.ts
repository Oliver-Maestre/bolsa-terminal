export interface OHLCVBar {
  time: number;
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
  priceVsEMA200: number;
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
  sparkline: number[];
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

export interface PortfolioPosition {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  addedAt: number;
}

// ─── Paper Broker ─────────────────────────────────────────────────────────────

export interface BrokerOrder {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  fee: number;
  status: 'FILLED' | 'CANCELLED' | 'REJECTED';
  timestamp: number;
  source: 'MANUAL' | 'BOT';
  reason?: string;
}

export interface BrokerPosition {
  symbol: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  cost: number;
  pnl: number;
  pnlPct: number;
  stopLoss?: number;
  takeProfit?: number;
  openedAt: number;
  source: 'MANUAL' | 'BOT';
}

export interface BrokerAccount {
  cash: number;
  initialBalance: number;
  positions: BrokerPosition[];
  orders: BrokerOrder[];
  totalEquity: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPct: number;
  totalFeesPaid: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  winRate: number;
}

// ─── Trading Bot ──────────────────────────────────────────────────────────────

export type BotMode = 'conservative' | 'moderate' | 'aggressive';

export interface BotConfig {
  enabled: boolean;
  mode: BotMode;
  targetSymbols: string[];
  scanInterval: number;
}

export interface BotParams {
  minScore: number;
  maxRSI: number;
  stopLossPct: number;
  takeProfitPct: number;
  maxPositions: number;
  positionSizePct: number;
  sellScore: number;
}

export interface BotStatus {
  config: BotConfig;
  params: BotParams;
  scanCount: number;
  isRunning: boolean;
  logCount: number;
}

export interface BotLogEntry {
  id: string;
  timestamp: number;
  action: 'BUY' | 'SELL' | 'HOLD' | 'SCAN' | 'INFO' | 'ERROR';
  symbol?: string;
  price?: number;
  quantity?: number;
  reason: string;
  score?: number;
  rsi?: number;
  pnl?: number;
}

// ─── AI / Investment Analyzer ─────────────────────────────────────────────────

export type InvestmentTimeframe = 'short' | 'medium' | 'long';

export interface InvestmentRecommendation {
  symbol: string;
  shortName: string;
  exchange: string;
  price: number;
  signal: string;
  score: number;
  rsi: number;
  macdHistogram: number;
  bbPercent: number;
  changePercent: number;
  timeframe: InvestmentTimeframe;
  confidence: number;
  entryZone: [number, number];
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  reasons: string[];
  risks: string[];
  horizon: string;
  strategy: string;
}

export interface AiRecommendations {
  short: InvestmentRecommendation[];
  medium: InvestmentRecommendation[];
  long: InvestmentRecommendation[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ─── Simulator ────────────────────────────────────────────────────────────────

export type BacktestRating = 'excellent' | 'good' | 'neutral' | 'poor' | 'bad';

export interface BacktestChartPoint {
  date: string;
  symbol: number;
  spx?: number;
  ibex?: number;
}

export interface BacktestResult {
  symbol: string;
  buyDate: string;
  sellDate: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  pnl: number;
  returnPct: number;
  annualizedReturn: number;
  holdDays: number;
  rating: BacktestRating;
  alphaSPX: number | null;
  benchmarkReturnSPX: number | null;
  benchmarkReturnIBEX: number | null;
  chart: BacktestChartPoint[];
}

export interface ProjectionHorizon {
  key: string;
  label: string;
  days: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  retP50: number;
  retP25: number;
  retP75: number;
  probProfit: number;
}

export interface ProjectionResult {
  symbol: string;
  currentPrice: number;
  investment: number;
  shares: number;
  annualReturn: number;
  annualVol: number;
  dataPoints: number;
  projections: ProjectionHorizon[];
}

// ─── Tax Calculator (frontend-only) ─────────────────────────────────────────

export interface TaxLot {
  id: string;
  symbol: string;
  buyDate: string;
  buyPrice: number;
  quantity: number;
  currency: 'EUR' | 'USD';
  eurRateAtBuy: number; // EUR/USD rate at buy date (approximate)
}

export interface TaxSale {
  id: string;
  symbol: string;
  sellDate: string;
  sellPrice: number;
  quantity: number;
  currency: 'EUR' | 'USD';
  eurRateAtSell: number;
}

export interface FIFOMatch {
  lotId: string;
  buyDate: string;
  buyPriceEur: number;
  sellPriceEur: number;
  quantity: number;
  gainEur: number;
  holdDays: number;
}

export interface TaxTradeResult {
  saleId: string;
  symbol: string;
  sellDate: string;
  totalQuantity: number;
  totalGainEur: number;
  matches: FIFOMatch[];
  washSaleWarning: boolean;
}

export interface IRPFBracket {
  from: number;
  to: number;
  taxable: number;
  rate: number;
  tax: number;
}

export interface IRPFResult {
  grossGain: number;
  grossLoss: number;
  netGain: number;
  taxableBase: number;
  totalTax: number;
  netAfterTax: number;
  effectiveRate: number;
  brackets: IRPFBracket[];
  carryForward: number; // losses to carry forward
}
