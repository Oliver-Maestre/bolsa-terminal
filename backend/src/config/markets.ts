export interface SymbolDef {
  symbol: string;
  name: string;
  sector?: string;
}

export interface MarketConfig {
  id: string;
  name: string;
  suffix: string;
  timezone: string;
  openTime: string;
  closeTime: string;
  flag: string;
  indices: SymbolDef[];
  tickers: SymbolDef[];
}

export const MARKETS: MarketConfig[] = [
  {
    id: 'NASDAQ',
    name: 'NASDAQ',
    suffix: '',
    timezone: 'America/New_York',
    openTime: '09:30',
    closeTime: '16:00',
    flag: '🇺🇸',
    indices: [
      { symbol: '^IXIC', name: 'NASDAQ Composite' },
      { symbol: '^NDX', name: 'NASDAQ-100' },
    ],
    tickers: [
      { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology' },
      { symbol: 'META', name: 'Meta Platforms', sector: 'Communication Services' },
      { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical' },
      { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology' },
      { symbol: 'ASML', name: 'ASML Holding', sector: 'Technology' },
      { symbol: 'COST', name: 'Costco Wholesale', sector: 'Consumer Defensive' },
      { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services' },
      { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology' },
      { symbol: 'INTC', name: 'Intel Corp.', sector: 'Technology' },
      { symbol: 'QCOM', name: 'Qualcomm Inc.', sector: 'Technology' },
      { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },
      { symbol: 'PYPL', name: 'PayPal Holdings', sector: 'Financial Services' },
      { symbol: 'MRNA', name: 'Moderna Inc.', sector: 'Healthcare' },
      { symbol: 'PANW', name: 'Palo Alto Networks', sector: 'Technology' },
      { symbol: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology' },
      { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology' },
    ],
  },
  {
    id: 'NYSE',
    name: 'NYSE',
    suffix: '',
    timezone: 'America/New_York',
    openTime: '09:30',
    closeTime: '16:00',
    flag: '🇺🇸',
    indices: [
      { symbol: '^GSPC', name: 'S&P 500' },
      { symbol: '^DJI', name: 'Dow Jones Industrial' },
    ],
    tickers: [
      { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financial Services' },
      { symbol: 'BAC', name: 'Bank of America', sector: 'Financial Services' },
      { symbol: 'GS', name: 'Goldman Sachs', sector: 'Financial Services' },
      { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial Services' },
      { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
      { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
      { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare' },
      { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy' },
      { symbol: 'CVX', name: 'Chevron Corp.', sector: 'Energy' },
      { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer Defensive' },
      { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Defensive' },
      { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive' },
      { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services' },
      { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial Services' },
      { symbol: 'DIS', name: 'Walt Disney Co.', sector: 'Communication Services' },
      { symbol: 'BA', name: 'Boeing Co.', sector: 'Industrials' },
      { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials' },
      { symbol: 'GE', name: 'GE Aerospace', sector: 'Industrials' },
      { symbol: 'BRK-B', name: 'Berkshire Hathaway B', sector: 'Financial Services' },
      { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication Services' },
    ],
  },
  {
    id: 'BME',
    name: 'Bolsa de Madrid',
    suffix: '.MC',
    timezone: 'Europe/Madrid',
    openTime: '09:00',
    closeTime: '17:30',
    flag: '🇪🇸',
    indices: [
      { symbol: '^IBEX', name: 'IBEX 35' },
    ],
    tickers: [
      { symbol: 'SAN.MC', name: 'Banco Santander', sector: 'Financial Services' },
      { symbol: 'BBVA.MC', name: 'BBVA', sector: 'Financial Services' },
      { symbol: 'TEF.MC', name: 'Telefónica', sector: 'Communication Services' },
      { symbol: 'IBE.MC', name: 'Iberdrola', sector: 'Utilities' },
      { symbol: 'REP.MC', name: 'Repsol', sector: 'Energy' },
      { symbol: 'ITX.MC', name: 'Inditex', sector: 'Consumer Cyclical' },
      { symbol: 'AENA.MC', name: 'AENA', sector: 'Industrials' },
      { symbol: 'AMS.MC', name: 'Amadeus IT', sector: 'Technology' },
      { symbol: 'FER.MC', name: 'Ferrovial', sector: 'Industrials' },
      { symbol: 'CIE.MC', name: 'CIE Automotive', sector: 'Consumer Cyclical' },
      { symbol: 'GRF.MC', name: 'Grifols', sector: 'Healthcare' },
      { symbol: 'MAP.MC', name: 'Mapfre', sector: 'Financial Services' },
      { symbol: 'MTS.MC', name: 'ArcelorMittal', sector: 'Basic Materials' },
      { symbol: 'NTGY.MC', name: 'Naturgy Energy', sector: 'Utilities' },
      { symbol: 'RED.MC', name: 'Red Eléctrica', sector: 'Utilities' },
    ],
  },
  {
    id: 'LSE',
    name: 'London Stock Exchange',
    suffix: '.L',
    timezone: 'Europe/London',
    openTime: '08:00',
    closeTime: '16:30',
    flag: '🇬🇧',
    indices: [
      { symbol: '^FTSE', name: 'FTSE 100' },
    ],
    tickers: [
      { symbol: 'HSBA.L', name: 'HSBC Holdings', sector: 'Financial Services' },
      { symbol: 'SHEL.L', name: 'Shell PLC', sector: 'Energy' },
      { symbol: 'AZN.L', name: 'AstraZeneca', sector: 'Healthcare' },
      { symbol: 'ULVR.L', name: 'Unilever', sector: 'Consumer Defensive' },
      { symbol: 'RIO.L', name: 'Rio Tinto', sector: 'Basic Materials' },
      { symbol: 'BP.L', name: 'BP PLC', sector: 'Energy' },
      { symbol: 'GSK.L', name: 'GSK PLC', sector: 'Healthcare' },
      { symbol: 'BARC.L', name: 'Barclays PLC', sector: 'Financial Services' },
      { symbol: 'LLOY.L', name: 'Lloyds Banking Group', sector: 'Financial Services' },
      { symbol: 'VOD.L', name: 'Vodafone Group', sector: 'Communication Services' },
    ],
  },
  {
    id: 'CRYPTO',
    name: 'Crypto',
    suffix: '-USD',
    timezone: 'UTC',
    openTime: '00:00',
    closeTime: '23:59',
    flag: '₿',
    indices: [
      { symbol: 'BTC-USD', name: 'Bitcoin' },
    ],
    tickers: [
      { symbol: 'BTC-USD', name: 'Bitcoin', sector: 'Cryptocurrency' },
      { symbol: 'ETH-USD', name: 'Ethereum', sector: 'Cryptocurrency' },
      { symbol: 'SOL-USD', name: 'Solana', sector: 'Cryptocurrency' },
      { symbol: 'BNB-USD', name: 'BNB', sector: 'Cryptocurrency' },
      { symbol: 'XRP-USD', name: 'XRP', sector: 'Cryptocurrency' },
      { symbol: 'ADA-USD', name: 'Cardano', sector: 'Cryptocurrency' },
      { symbol: 'AVAX-USD', name: 'Avalanche', sector: 'Cryptocurrency' },
      { symbol: 'DOGE-USD', name: 'Dogecoin', sector: 'Cryptocurrency' },
      { symbol: 'MATIC-USD', name: 'Polygon', sector: 'Cryptocurrency' },
      { symbol: 'DOT-USD', name: 'Polkadot', sector: 'Cryptocurrency' },
    ],
  },
];

export const ALL_INDICES = MARKETS.flatMap((m) => m.indices.map((i) => ({ ...i, marketId: m.id })));

export const ALL_TICKERS = MARKETS.flatMap((m) =>
  m.tickers.map((t) => ({ ...t, marketId: m.id }))
);
