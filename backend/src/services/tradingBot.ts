/**
 * Automated Paper Trading Bot
 *
 * Strategies by mode:
 *  conservative : score ≥ 5, RSI < 35, SL=5%,  TP=12%, maxPos=3, size=8%
 *  moderate     : score ≥ 3, RSI < 42, SL=8%,  TP=20%, maxPos=5, size=12%
 *  aggressive   : score ≥ 2, RSI < 50, SL=12%, TP=30%, maxPos=8, size=18%
 *
 * Sell triggers: score drops ≤ -3, stop-loss hit, take-profit hit
 */

import { broker } from './paperBroker';
import { ScreenerItem } from '../types/index';
import * as cache from './cache';
import { v4 as uuid } from 'uuid';

export type BotMode = 'conservative' | 'moderate' | 'aggressive';

export interface BotConfig {
  enabled: boolean;
  mode: BotMode;
  targetSymbols: string[]; // empty = all from screener
  scanInterval: number;    // seconds
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

const MODE_PARAMS: Record<BotMode, {
  minScore: number; maxRSI: number;
  stopLossPct: number; takeProfitPct: number;
  maxPositions: number; positionSizePct: number;
  sellScore: number;
}> = {
  conservative: { minScore: 5, maxRSI: 35, stopLossPct: 5,  takeProfitPct: 12, maxPositions: 3, positionSizePct: 8,  sellScore: -3 },
  moderate:     { minScore: 3, maxRSI: 42, stopLossPct: 8,  takeProfitPct: 20, maxPositions: 5, positionSizePct: 12, sellScore: -3 },
  aggressive:   { minScore: 2, maxRSI: 50, stopLossPct: 12, takeProfitPct: 30, maxPositions: 8, positionSizePct: 18, sellScore: -2 },
};

class TradingBot {
  private config: BotConfig = {
    enabled: false,
    mode: 'moderate',
    targetSymbols: [],
    scanInterval: 60,
  };
  private log: BotLogEntry[] = [];
  private timer: NodeJS.Timeout | null = null;
  private scanCount = 0;

  configure(updates: Partial<BotConfig>) {
    const wasEnabled = this.config.enabled;
    this.config = { ...this.config, ...updates };

    if (this.config.enabled && !wasEnabled) {
      this.addLog('INFO', undefined, 'Bot iniciado. Modo: ' + this.config.mode);
      this.scheduleNext();
    } else if (!this.config.enabled && wasEnabled) {
      this.stop();
      this.addLog('INFO', undefined, 'Bot detenido manualmente.');
    } else if (this.config.enabled && wasEnabled) {
      // Restart timer if interval changed
      this.stop();
      this.scheduleNext();
    }
  }

  stop() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
  }

  private scheduleNext() {
    this.timer = setTimeout(async () => {
      if (!this.config.enabled) return;
      try { await this.scan(); } catch (err) {
        this.addLog('ERROR', undefined, `Error en scan: ${(err as Error).message}`);
      }
      if (this.config.enabled) this.scheduleNext();
    }, this.config.scanInterval * 1000);
  }

  async scan() {
    this.scanCount++;
    const params = MODE_PARAMS[this.config.mode];
    this.addLog('SCAN', undefined, `Scan #${this.scanCount} — modo ${this.config.mode} (score≥${params.minScore}, RSI<${params.maxRSI})`);

    const screener = cache.get<ScreenerItem[]>('screener:all') ?? [];
    if (!screener.length) {
      this.addLog('INFO', undefined, 'Sin datos de screener disponibles. Reintentando...');
      return;
    }

    // Filter by target symbols if configured
    const universe = this.config.targetSymbols.length > 0
      ? screener.filter((item) => this.config.targetSymbols.includes(item.symbol))
      : screener;

    // Update broker prices from screener
    for (const item of universe) {
      broker.updatePrice(item.symbol, item.price);
    }

    const account = broker.getAccount();
    const currentPositions = account.positions.length;

    // ── 1. Check exit conditions on current positions ───────────────
    for (const pos of account.positions) {
      const item = screener.find((s) => s.symbol === pos.symbol);
      if (!item) continue;

      const currentPrice = item.price;
      const pnlPct = ((currentPrice - pos.avgCost) / pos.avgCost) * 100;

      let shouldSell = false;
      let reason = '';

      // Stop-loss
      if (pos.stopLoss && currentPrice <= pos.stopLoss) {
        shouldSell = true;
        reason = `Stop-loss activado @ $${currentPrice.toFixed(2)} (${pnlPct.toFixed(1)}%)`;
      }
      // Take-profit
      else if (pos.takeProfit && currentPrice >= pos.takeProfit) {
        shouldSell = true;
        reason = `Take-profit alcanzado @ $${currentPrice.toFixed(2)} (+${pnlPct.toFixed(1)}%)`;
      }
      // Signal deterioration
      else if (item.score <= params.sellScore) {
        shouldSell = true;
        reason = `Señal bajista: score=${item.score} (${item.signal})`;
      }

      if (shouldSell) {
        const result = broker.sellAll(pos.symbol, currentPrice, 'BOT', reason);
        if (result.success) {
          this.addLog('SELL', pos.symbol, reason, {
            price: currentPrice, quantity: pos.quantity,
            score: item.score, rsi: item.rsi, pnl: result.pnl,
          });
        }
      }
    }

    // ── 2. Evaluate buy candidates ──────────────────────────────────
    const refreshedAccount = broker.getAccount();
    const openCount = refreshedAccount.positions.length;

    if (openCount >= params.maxPositions) {
      this.addLog('INFO', undefined, `Máximo de posiciones alcanzado (${openCount}/${params.maxPositions}). No se abren nuevas.`);
      return;
    }

    // Rank candidates: highest score first
    const candidates = universe
      .filter((item) =>
        item.score >= params.minScore &&
        item.rsi <= params.maxRSI &&
        !broker.hasPosition(item.symbol)
      )
      .sort((a, b) => b.score - a.score || a.rsi - b.rsi)
      .slice(0, params.maxPositions - openCount);

    for (const item of candidates) {
      const positionValue = refreshedAccount.totalEquity * (params.positionSizePct / 100);
      const quantity = Math.floor(positionValue / item.price);
      if (quantity < 1) {
        this.addLog('INFO', item.symbol, `Fondos insuficientes para abrir posición (necesario: $${item.price.toFixed(2)}/acción)`);
        continue;
      }

      const stopLoss   = item.price * (1 - params.stopLossPct / 100);
      const takeProfit = item.price * (1 + params.takeProfitPct / 100);

      const result = broker.buy(
        item.symbol, quantity, item.price, 'BOT',
        `Score=${item.score}, RSI=${item.rsi.toFixed(1)}, señal=${item.signal}`,
        stopLoss, takeProfit
      );

      if (result.success) {
        this.addLog('BUY', item.symbol,
          `Compra ${quantity} × $${item.price.toFixed(2)} | SL=$${stopLoss.toFixed(2)} TP=$${takeProfit.toFixed(2)}`,
          { price: item.price, quantity, score: item.score, rsi: item.rsi }
        );
      } else {
        this.addLog('INFO', item.symbol, `No se pudo comprar: ${result.error}`);
      }
    }

    if (!candidates.length) {
      this.addLog('HOLD', undefined, 'Sin oportunidades de compra que cumplan los criterios');
    }
  }

  private addLog(
    action: BotLogEntry['action'],
    symbol?: string,
    reason = '',
    extra?: { price?: number; quantity?: number; score?: number; rsi?: number; pnl?: number }
  ) {
    const entry: BotLogEntry = {
      id: uuid(), timestamp: Date.now(), action, symbol, reason, ...extra,
    };
    this.log.unshift(entry);
    if (this.log.length > 500) this.log.pop(); // keep last 500 entries
  }

  getStatus() {
    return {
      config: this.config,
      params: MODE_PARAMS[this.config.mode],
      scanCount: this.scanCount,
      isRunning: this.timer !== null,
      logCount: this.log.length,
    };
  }

  getLog(limit = 100): BotLogEntry[] {
    return this.log.slice(0, limit);
  }

  getConfig(): BotConfig { return { ...this.config }; }
}

export const tradingBot = new TradingBot();
