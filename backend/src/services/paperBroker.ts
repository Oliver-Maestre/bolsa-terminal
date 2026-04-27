/**
 * Paper Trading Broker — in-memory virtual account
 * Simulates buy/sell execution at provided prices
 */

import { v4 as uuid } from 'uuid';

const INITIAL_BALANCE = 100_000; // $100k starting capital

export interface BrokerOrder {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  fee: number;        // simulated 0.1% commission
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

const FEE_RATE = 0.001; // 0.1% per trade

class PaperBroker {
  private cash = INITIAL_BALANCE;
  private positions = new Map<string, { quantity: number; avgCost: number; stopLoss?: number; takeProfit?: number; openedAt: number; source: 'MANUAL' | 'BOT' }>();
  private orders: BrokerOrder[] = [];
  private prices = new Map<string, number>();
  private totalFeesPaid = 0;
  private winCount = 0;
  private lossCount = 0;

  updatePrice(symbol: string, price: number) {
    this.prices.set(symbol.toUpperCase(), price);
  }

  updatePrices(priceMap: Record<string, number>) {
    for (const [sym, price] of Object.entries(priceMap)) {
      this.prices.set(sym.toUpperCase(), price);
    }
  }

  buy(
    symbol: string,
    quantity: number,
    price: number,
    source: 'MANUAL' | 'BOT' = 'MANUAL',
    reason?: string,
    stopLoss?: number,
    takeProfit?: number
  ): { success: boolean; order?: BrokerOrder; error?: string } {
    const sym = symbol.toUpperCase();
    if (quantity <= 0) return { success: false, error: 'Quantity must be > 0' };
    if (price <= 0) return { success: false, error: 'Price must be > 0' };

    const total = quantity * price;
    const fee = total * FEE_RATE;
    const totalWithFee = total + fee;

    if (totalWithFee > this.cash) {
      return { success: false, error: `Fondos insuficientes. Necesario: $${totalWithFee.toFixed(2)}, Disponible: $${this.cash.toFixed(2)}` };
    }

    this.cash -= totalWithFee;
    this.totalFeesPaid += fee;
    this.prices.set(sym, price);

    const existing = this.positions.get(sym);
    if (existing) {
      const newQty = existing.quantity + quantity;
      const newAvg = (existing.quantity * existing.avgCost + quantity * price) / newQty;
      this.positions.set(sym, { ...existing, quantity: newQty, avgCost: newAvg });
    } else {
      this.positions.set(sym, { quantity, avgCost: price, stopLoss, takeProfit, openedAt: Date.now(), source });
    }

    const order: BrokerOrder = {
      id: uuid(), symbol: sym, side: 'BUY', quantity, price, total, fee,
      status: 'FILLED', timestamp: Date.now(), source, reason,
    };
    this.orders.push(order);
    return { success: true, order };
  }

  sell(
    symbol: string,
    quantity: number,
    price: number,
    source: 'MANUAL' | 'BOT' = 'MANUAL',
    reason?: string
  ): { success: boolean; order?: BrokerOrder; error?: string; pnl?: number } {
    const sym = symbol.toUpperCase();
    const pos = this.positions.get(sym);
    if (!pos) return { success: false, error: `No position in ${sym}` };
    if (quantity > pos.quantity) return { success: false, error: 'Cantidad supera la posición disponible' };

    const total = quantity * price;
    const fee = total * FEE_RATE;
    this.cash += total - fee;
    this.totalFeesPaid += fee;
    this.prices.set(sym, price);

    const tradePnL = (price - pos.avgCost) * quantity - fee;
    if (tradePnL >= 0) this.winCount++; else this.lossCount++;

    if (quantity >= pos.quantity) {
      this.positions.delete(sym);
    } else {
      this.positions.set(sym, { ...pos, quantity: pos.quantity - quantity });
    }

    const order: BrokerOrder = {
      id: uuid(), symbol: sym, side: 'SELL', quantity, price, total, fee,
      status: 'FILLED', timestamp: Date.now(), source, reason,
    };
    this.orders.push(order);
    return { success: true, order, pnl: tradePnL };
  }

  sellAll(symbol: string, price: number, source: 'MANUAL' | 'BOT', reason?: string) {
    const sym = symbol.toUpperCase();
    const pos = this.positions.get(sym);
    if (!pos) return { success: false, error: 'No position' };
    return this.sell(sym, pos.quantity, price, source, reason);
  }

  getAccount(): BrokerAccount {
    const positions: BrokerPosition[] = [];
    let totalCost = 0;
    let totalValue = 0;

    for (const [sym, pos] of this.positions.entries()) {
      const currentPrice = this.prices.get(sym) ?? pos.avgCost;
      const cost  = pos.quantity * pos.avgCost;
      const value = pos.quantity * currentPrice;
      const pnl   = value - cost;
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
      totalCost  += cost;
      totalValue += value;
      positions.push({
        symbol: sym, quantity: pos.quantity, avgCost: pos.avgCost,
        currentPrice, value, cost, pnl, pnlPct,
        stopLoss: pos.stopLoss, takeProfit: pos.takeProfit,
        openedAt: pos.openedAt, source: pos.source,
      });
    }

    const totalEquity  = this.cash + totalValue;
    const totalPnL     = totalEquity - INITIAL_BALANCE;
    const totalPnLPct  = (totalPnL / INITIAL_BALANCE) * 100;
    const tradeCount   = this.winCount + this.lossCount;
    const winRate      = tradeCount > 0 ? (this.winCount / tradeCount) * 100 : 0;

    return {
      cash: this.cash, initialBalance: INITIAL_BALANCE, positions,
      orders: [...this.orders].reverse(), // newest first
      totalEquity, totalCost, totalPnL, totalPnLPct,
      totalFeesPaid: this.totalFeesPaid, tradeCount, winCount: this.winCount,
      lossCount: this.lossCount, winRate,
    };
  }

  getPosition(symbol: string) {
    return this.positions.get(symbol.toUpperCase()) ?? null;
  }

  hasPosition(symbol: string): boolean {
    return this.positions.has(symbol.toUpperCase());
  }

  getCash(): number { return this.cash; }

  reset() {
    this.cash = INITIAL_BALANCE;
    this.positions.clear();
    this.orders = [];
    this.prices.clear();
    this.totalFeesPaid = 0;
    this.winCount = 0;
    this.lossCount = 0;
  }
}

export const broker = new PaperBroker();
