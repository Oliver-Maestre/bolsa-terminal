import axios from 'axios';
import { QuoteSummary, HistoryResponse, SearchResult, ScreenerItem, MarketIndex } from '../types/index.js';

const api = axios.create({ baseURL: '/api' });

export async function fetchQuote(symbol: string): Promise<QuoteSummary> {
  const { data } = await api.get<QuoteSummary>(`/quotes/${symbol}`);
  return data;
}

export async function fetchBatchQuotes(symbols: string[]): Promise<QuoteSummary[]> {
  const { data } = await api.get<QuoteSummary[]>('/quotes', {
    params: { symbols: symbols.join(',') },
  });
  return data;
}

export async function fetchHistory(
  symbol: string,
  period = '10y',
  interval = '1d'
): Promise<HistoryResponse> {
  const { data } = await api.get<HistoryResponse>(`/history/${symbol}`, {
    params: { period, interval },
  });
  return data;
}

export async function fetchSearch(q: string): Promise<SearchResult[]> {
  const { data } = await api.get<SearchResult[]>('/search', { params: { q } });
  return data;
}

export async function fetchScreener(params: Record<string, string>): Promise<ScreenerItem[]> {
  const { data } = await api.get<ScreenerItem[]>('/screener', { params });
  return data;
}

export async function fetchMarketOverview(): Promise<MarketIndex[]> {
  const { data } = await api.get<MarketIndex[]>('/markets/overview');
  return data;
}

// ─── Broker API ────────────────────────────────────────────────────────────────

export async function fetchBrokerAccount() {
  const { data } = await api.get('/broker/account');
  return data;
}

export async function placeBrokerOrder(payload: {
  symbol: string; side: 'BUY' | 'SELL'; quantity: number;
  price?: number; stopLoss?: number; takeProfit?: number; reason?: string;
}) {
  const { data } = await api.post('/broker/order', payload);
  return data;
}

export async function sellAllBroker(symbol: string) {
  const { data } = await api.post(`/broker/sell-all/${encodeURIComponent(symbol)}`);
  return data;
}

export async function resetBroker() {
  const { data } = await api.post('/broker/reset');
  return data;
}

// ─── Bot API ──────────────────────────────────────────────────────────────────

export async function fetchBotStatus() {
  const { data } = await api.get('/bot/status');
  return data;
}

export async function fetchBotLog(limit = 100) {
  const { data } = await api.get('/bot/log', { params: { limit } });
  return data;
}

export async function configureBotApi(updates: {
  enabled?: boolean; mode?: string; targetSymbols?: string[]; scanInterval?: number;
}) {
  const { data } = await api.post('/bot/configure', updates);
  return data;
}

export async function triggerBotScan() {
  const { data } = await api.post('/bot/scan');
  return data;
}

// ─── AI API ───────────────────────────────────────────────────────────────────

export async function fetchAiRecommendations() {
  const { data } = await api.get('/ai/recommendations');
  return data;
}

export async function fetchAiStatus() {
  const { data } = await api.get('/ai/status');
  return data;
}

/** Streaming chat — calls callback for each chunk, returns full response */
export async function streamAiChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  onChunk: (chunk: string) => void
): Promise<string> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`AI chat error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    for (const line of text.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      try {
        const json = JSON.parse(line.slice(6));
        if (json.chunk) { onChunk(json.chunk); full += json.chunk; }
        if (json.done) return full;
        if (json.error) throw new Error(json.error);
      } catch { /* skip malformed */ }
    }
  }
  return full;
}

// ── Simulator ─────────────────────────────────────────────────────────────────

export async function fetchBacktest(params: {
  symbol: string;
  buyDate: string;
  sellDate?: string;
  quantity?: number;
}): Promise<import('../types').BacktestResult> {
  const { data } = await api.get('/simulator/backtest', { params });
  return data;
}

export async function fetchProjection(params: {
  symbol: string;
  amount: number;
}): Promise<import('../types').ProjectionResult> {
  const { data } = await api.get('/simulator/projection', { params });
  return data;
}
