import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PortfolioPosition } from '../types/index.js';

interface WatchlistState {
  symbols: string[];
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  hasSymbol: (symbol: string) => boolean;
}

interface PortfolioState {
  positions: PortfolioPosition[];
  addPosition: (pos: Omit<PortfolioPosition, 'id' | 'addedAt'>) => void;
  removePosition: (id: string) => void;
  updatePosition: (id: string, updates: Partial<PortfolioPosition>) => void;
}

interface UIState {
  activeMarket: string;
  setActiveMarket: (market: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: ['AAPL', 'MSFT', 'NVDA', 'SAN.MC', 'IBEX', 'BTC-USD'],
      addSymbol: (symbol) => {
        if (!get().symbols.includes(symbol)) {
          set((s) => ({ symbols: [...s.symbols, symbol] }));
        }
      },
      removeSymbol: (symbol) =>
        set((s) => ({ symbols: s.symbols.filter((sym) => sym !== symbol) })),
      hasSymbol: (symbol) => get().symbols.includes(symbol),
    }),
    { name: 'bolsa-watchlist' }
  )
);

export const usePortfolio = create<PortfolioState>()(
  persist(
    (set) => ({
      positions: [],
      addPosition: (pos) =>
        set((s) => ({
          positions: [
            ...s.positions,
            { ...pos, id: crypto.randomUUID(), addedAt: Date.now() },
          ],
        })),
      removePosition: (id) =>
        set((s) => ({ positions: s.positions.filter((p) => p.id !== id) })),
      updatePosition: (id, updates) =>
        set((s) => ({
          positions: s.positions.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
    }),
    { name: 'bolsa-portfolio' }
  )
);

export const useUI = create<UIState>()((set) => ({
  activeMarket: 'ALL',
  setActiveMarket: (market) => set({ activeMarket: market }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
