/**
 * Investment Analyzer — purely algorithmic, no external AI
 *
 * Generates ranked investment recommendations for three timeframes:
 *   short  (1-15 days)  : momentum + RSI oversold recovery
 *   medium (1-3 months) : trend following + score confirmation
 *   long   (6-24 months): strong fundamentals + EMA200 trend
 */

import { ScreenerItem } from '../types/index';
import * as cache from './cache';

export type Timeframe = 'short' | 'medium' | 'long';

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
  timeframe: Timeframe;
  confidence: number;        // 0-100
  entryZone: [number, number];
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  reasons: string[];
  risks: string[];
  horizon: string;
  strategy: string;
}

interface TimeframeConfig {
  minScore: number;
  maxScore: number;        // avoid already too extended
  minRSI: number;
  maxRSI: number;
  maxBBPercent: number;
  horizon: string;
  strategy: string;
  slPct: number;           // stop-loss %
  tpPct: number;           // take-profit %
}

const CONFIGS: Record<Timeframe, TimeframeConfig> = {
  short: {
    minScore: 2, maxScore: 9,
    minRSI: 28, maxRSI: 52,    // buy when recovering from oversold
    maxBBPercent: 0.55,         // not already extended
    horizon: '1-15 días',
    strategy: 'Momentum / Rebote técnico',
    slPct: 4, tpPct: 8,
  },
  medium: {
    minScore: 3, maxScore: 9,
    minRSI: 35, maxRSI: 62,    // trend in motion but not overbought
    maxBBPercent: 0.70,
    horizon: '1-3 meses',
    strategy: 'Seguimiento de tendencia',
    slPct: 7, tpPct: 18,
  },
  long: {
    minScore: 4, maxScore: 9,
    minRSI: 38, maxRSI: 68,
    maxBBPercent: 0.80,         // long-term trend, more tolerance
    horizon: '6-24 meses',
    strategy: 'Posición de largo plazo',
    slPct: 12, tpPct: 35,
  },
};

function confidence(item: ScreenerItem, cfg: TimeframeConfig): number {
  let score = 0;

  // Score contribution (0-35 pts)
  score += Math.min(item.score * 4, 35);

  // RSI in ideal zone (0-25 pts)
  const rsiIdeal = cfg.minRSI + (cfg.maxRSI - cfg.minRSI) * 0.3;
  const rsiDist = Math.abs(item.rsi - rsiIdeal) / (cfg.maxRSI - cfg.minRSI);
  score += Math.max(0, 25 - rsiDist * 25);

  // MACD positive (0-20 pts)
  if (item.macdHistogram > 0) score += 10;
  if (item.macdHistogram > 0.5) score += 10;

  // BB not overextended (0-20 pts)
  score += Math.max(0, 20 - item.bbPercent * 20);

  return Math.min(Math.round(score), 100);
}

function buildReasons(item: ScreenerItem, tf: Timeframe): string[] {
  const reasons: string[] = [];

  if (item.score >= 5) reasons.push('Señal técnica muy fuerte: STRONG BUY');
  else if (item.score >= 3) reasons.push('Señal técnica positiva: BUY');
  else reasons.push('Señal de compra incipiente');

  if (item.rsi < 35) reasons.push(`RSI ${item.rsi.toFixed(1)} — zona de sobreventa (oportunidad de entrada)`);
  else if (item.rsi < 50) reasons.push(`RSI ${item.rsi.toFixed(1)} — momentum alcista en construcción`);
  else reasons.push(`RSI ${item.rsi.toFixed(1)} — tendencia activa`);

  if (item.macdHistogram > 0) reasons.push('MACD por encima de señal — momentum positivo');
  if (item.bbPercent < 0.3) reasons.push('Precio cerca de la banda inferior de Bollinger — posible suelo');
  if (item.bbPercent < 0.5) reasons.push('Precio en la mitad inferior de Bollinger — margen de subida');

  if (tf === 'long') reasons.push('Estructura técnica favorable para mantener meses');
  if (tf === 'short') reasons.push('Configuración ideal para operativa de swing corto');

  return reasons.slice(0, 4);
}

function buildRisks(item: ScreenerItem, tf: Timeframe): string[] {
  const risks: string[] = [];

  if (item.rsi > 45) risks.push('RSI no está en zona de sobreventa — entrada menos limpia');
  if (item.macdHistogram < 0) risks.push('MACD negativo — confirmar señal antes de entrar');
  if (item.bbPercent > 0.6) risks.push('Precio en parte alta de Bollinger — posible resistencia próxima');
  if (item.changePercent < -3) risks.push('Jornada bajista reciente — esperar estabilización');
  if (tf === 'short') risks.push('Estrategia de corto plazo: alta volatilidad, usar stop-loss siempre');
  if (tf === 'long') risks.push('Posición a largo plazo expuesta a cambios de ciclo macroeconómico');

  risks.push('Todos los activos pueden perder valor. Diversifica y usa gestión de riesgo.');
  return risks.slice(0, 3);
}

export function getRecommendations(timeframe: Timeframe, limit = 5): InvestmentRecommendation[] {
  const screener = cache.get<ScreenerItem[]>('screener:all') ?? [];
  if (!screener.length) return [];

  const cfg = CONFIGS[timeframe];

  const candidates = screener
    .filter((item) =>
      item.score >= cfg.minScore &&
      item.score <= cfg.maxScore &&
      item.rsi >= cfg.minRSI &&
      item.rsi <= cfg.maxRSI &&
      item.bbPercent <= cfg.maxBBPercent &&
      item.price > 0
    )
    .map((item) => ({ item, conf: confidence(item, cfg) }))
    .sort((a, b) => b.conf - a.conf || b.item.score - a.item.score)
    .slice(0, limit);

  return candidates.map(({ item, conf }) => {
    const sl = item.price * (1 - cfg.slPct / 100);
    const tp = item.price * (1 + cfg.tpPct / 100);
    const rr = cfg.tpPct / cfg.slPct;

    return {
      symbol: item.symbol,
      shortName: item.shortName,
      exchange: item.exchange,
      price: item.price,
      signal: item.signal,
      score: item.score,
      rsi: item.rsi,
      macdHistogram: item.macdHistogram,
      bbPercent: item.bbPercent,
      changePercent: item.changePercent,
      timeframe,
      confidence: conf,
      entryZone: [item.price * 0.99, item.price * 1.005] as [number, number],
      stopLoss: sl,
      takeProfit: tp,
      riskReward: Math.round(rr * 10) / 10,
      reasons: buildReasons(item, timeframe),
      risks: buildRisks(item, timeframe),
      horizon: cfg.horizon,
      strategy: cfg.strategy,
    };
  });
}

export function getAllRecommendations(): Record<Timeframe, InvestmentRecommendation[]> {
  return {
    short:  getRecommendations('short',  4),
    medium: getRecommendations('medium', 4),
    long:   getRecommendations('long',   4),
  };
}

/** Build a rich text summary for the AI context */
export function buildMarketContext(): string {
  const screener = cache.get<ScreenerItem[]>('screener:all') ?? [];
  if (!screener.length) return 'No hay datos de mercado disponibles en este momento.';

  const top = [...screener].sort((a, b) => b.score - a.score).slice(0, 8);
  const bottom = [...screener].sort((a, b) => a.score - b.score).slice(0, 4);
  const recs = getAllRecommendations();

  const lines: string[] = [
    `=== CONTEXTO DE MERCADO (${new Date().toLocaleString('es-ES')}) ===`,
    '',
    '--- TOP SEÑALES ALCISTAS ---',
    ...top.map((i) =>
      `${i.symbol} (${i.exchange}) | Precio: $${i.price.toFixed(2)} | Score: ${i.score > 0 ? '+' : ''}${i.score} | RSI: ${i.rsi.toFixed(1)} | MACD: ${i.macdHistogram > 0 ? '+' : ''}${i.macdHistogram.toFixed(3)} | Señal: ${i.signal}`
    ),
    '',
    '--- SEÑALES BAJISTAS ---',
    ...bottom.map((i) =>
      `${i.symbol} | Score: ${i.score} | RSI: ${i.rsi.toFixed(1)} | Señal: ${i.signal}`
    ),
    '',
    '--- RECOMENDACIONES ALGORÍTMICAS ---',
    'Corto plazo (1-15 días):',
    ...(recs.short.length
      ? recs.short.map((r) => `  ${r.symbol} | Confianza: ${r.confidence}% | Entrada: $${r.entryZone[0].toFixed(2)} | SL: $${r.stopLoss.toFixed(2)} | TP: $${r.takeProfit.toFixed(2)}`)
      : ['  Sin señales válidas en este momento']),
    'Medio plazo (1-3 meses):',
    ...(recs.medium.length
      ? recs.medium.map((r) => `  ${r.symbol} | Confianza: ${r.confidence}% | SL: $${r.stopLoss.toFixed(2)} | TP: $${r.takeProfit.toFixed(2)}`)
      : ['  Sin señales válidas en este momento']),
    'Largo plazo (6-24 meses):',
    ...(recs.long.length
      ? recs.long.map((r) => `  ${r.symbol} | Confianza: ${r.confidence}% | SL: $${r.stopLoss.toFixed(2)} | TP: $${r.takeProfit.toFixed(2)}`)
      : ['  Sin señales válidas en este momento']),
  ];

  return lines.join('\n');
}
