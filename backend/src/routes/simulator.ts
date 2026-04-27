import { Router } from 'express';
import { getHistoryAggregated } from '../services/dataAggregator';
import { OHLCVBar } from '../types/index';

const router = Router();

// ── HELPERS ───────────────────────────────────────────────────────────────────

/** Find the bar closest to a target date */
function findClosest(bars: OHLCVBar[], target: Date): OHLCVBar {
  const t = target.getTime() / 1000; // to seconds
  return bars.reduce((best, b) =>
    Math.abs(b.time - t) < Math.abs(best.time - t) ? b : best
  );
}

/** Convert Unix-seconds timestamp to YYYY-MM-DD */
function toDate(ts: number): string {
  return new Date(ts * 1000).toISOString().split('T')[0];
}

function boxMuller(): number {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ── BACKTEST ──────────────────────────────────────────────────────────────────
// GET /api/simulator/backtest?symbol=AAPL&buyDate=2023-01-01&quantity=10&sellDate=2024-01-01
router.get('/backtest', async (req, res) => {
  try {
    const { symbol, buyDate, sellDate, quantity = '1' } = req.query as Record<string, string>;

    if (!symbol || !buyDate) {
      return res.status(400).json({ error: 'Parámetros obligatorios: symbol, buyDate' });
    }

    const buy  = new Date(buyDate);
    const sell = sellDate ? new Date(sellDate) : new Date();

    if (buy >= sell) {
      return res.status(400).json({ error: 'La fecha de compra debe ser anterior a la de venta' });
    }

    // Period must cover from buyDate to today, not just buy-to-sell
    const daysFromBuyToNow = (Date.now() - buy.getTime()) / 86400000;
    const period = daysFromBuyToNow <= 180 ? '6mo'
                 : daysFromBuyToNow <= 730 ? '2y'
                 : '5y';

    const [history, spxHist, ibexHist] = await Promise.all([
      getHistoryAggregated(symbol.toUpperCase(), period, '1d'),
      getHistoryAggregated('^GSPC',  period, '1d').catch(() => null),
      getHistoryAggregated('^IBEX',  period, '1d').catch(() => null),
    ]);

    if (!history?.bars?.length) {
      return res.status(404).json({ error: 'Sin datos históricos para este símbolo' });
    }

    const buyBar  = findClosest(history.bars, buy);
    const sellBar = findClosest(history.bars, sell);
    const qty     = Math.max(parseFloat(quantity) || 1, 0.0001);

    const buyPrice  = buyBar.close;
    const sellPrice = sellBar.close;
    const pnl       = (sellPrice - buyPrice) * qty;
    const returnPct = ((sellPrice - buyPrice) / buyPrice) * 100;
    const holdDays  = Math.round((sellBar.time - buyBar.time) / 86400);
    const annualizedReturn =
      holdDays > 1 ? (Math.pow(1 + returnPct / 100, 365 / holdDays) - 1) * 100 : returnPct;

    // Build timestamp → close maps for benchmarks
    const spxMap:  Record<number, number> = {};
    const ibexMap: Record<number, number> = {};
    spxHist?.bars?.forEach(b  => { spxMap[b.time]  = b.close; });
    ibexHist?.bars?.forEach(b => { ibexMap[b.time] = b.close; });

    const spxBuyBar  = spxHist?.bars?.length  ? findClosest(spxHist.bars,  buy) : null;
    const ibexBuyBar = ibexHist?.bars?.length ? findClosest(ibexHist.bars, buy) : null;
    const spxSellBar  = spxHist?.bars?.length  ? findClosest(spxHist.bars,  sell) : null;
    const ibexSellBar = ibexHist?.bars?.length ? findClosest(ibexHist.bars, sell) : null;

    const benchmarkReturnSPX  = spxBuyBar  && spxSellBar  ? ((spxSellBar.close  - spxBuyBar.close)  / spxBuyBar.close)  * 100 : null;
    const benchmarkReturnIBEX = ibexBuyBar && ibexSellBar ? ((ibexSellBar.close - ibexBuyBar.close) / ibexBuyBar.close) * 100 : null;

    // Chart: % change from buy date for the hold period
    const chart = history.bars
      .filter(b => b.time >= buyBar.time && b.time <= sellBar.time)
      .map(b => {
        const entry: any = {
          date:   toDate(b.time),
          symbol: +((b.close - buyPrice) / buyPrice * 100).toFixed(3),
        };
        // Find nearest benchmark bar for this date (same time key won't always match)
        if (spxBuyBar && spxHist?.bars) {
          const sb = findClosest(spxHist.bars, new Date(b.time * 1000));
          if (Math.abs(sb.time - b.time) < 86400 * 3) {
            entry.spx = +((sb.close - spxBuyBar.close) / spxBuyBar.close * 100).toFixed(3);
          }
        }
        if (ibexBuyBar && ibexHist?.bars) {
          const ib = findClosest(ibexHist.bars, new Date(b.time * 1000));
          if (Math.abs(ib.time - b.time) < 86400 * 3) {
            entry.ibex = +((ib.close - ibexBuyBar.close) / ibexBuyBar.close * 100).toFixed(3);
          }
        }
        return entry;
      });

    let rating: 'excellent' | 'good' | 'neutral' | 'poor' | 'bad';
    if      (returnPct > 30)  rating = 'excellent';
    else if (returnPct > 10)  rating = 'good';
    else if (returnPct > 0)   rating = 'neutral';
    else if (returnPct > -10) rating = 'poor';
    else                       rating = 'bad';

    res.json({
      symbol:   symbol.toUpperCase(),
      buyDate:  toDate(buyBar.time),
      sellDate: toDate(sellBar.time),
      buyPrice, sellPrice, quantity: qty,
      pnl, returnPct, annualizedReturn, holdDays,
      rating, alphaSPX: benchmarkReturnSPX !== null ? returnPct - benchmarkReturnSPX : null,
      benchmarkReturnSPX, benchmarkReturnIBEX,
      chart,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── MONTE CARLO PROJECTION ────────────────────────────────────────────────────
// GET /api/simulator/projection?symbol=AAPL&amount=1000
router.get('/projection', async (req, res) => {
  try {
    const { symbol, amount = '1000' } = req.query as Record<string, string>;
    if (!symbol) return res.status(400).json({ error: 'symbol requerido' });

    const history = await getHistoryAggregated(symbol.toUpperCase(), '2y', '1d');
    if (!history?.bars || history.bars.length < 60) {
      return res.status(400).json({ error: 'Historial insuficiente (mínimo 60 sesiones)' });
    }

    const bars = history.bars;
    const logRet: number[] = [];
    for (let i = 1; i < bars.length; i++) {
      if (bars[i].close > 0 && bars[i - 1].close > 0) {
        logRet.push(Math.log(bars[i].close / bars[i - 1].close));
      }
    }

    const n      = logRet.length;
    const mu     = logRet.reduce((a, b) => a + b, 0) / n;
    const sigma2 = logRet.reduce((a, b) => a + (b - mu) ** 2, 0) / (n - 1);
    const sigma  = Math.sqrt(sigma2);

    const currentPrice = bars[bars.length - 1].close;
    const investUsd    = parseFloat(amount);
    const shares       = investUsd / currentPrice;

    const HORIZONS = [
      { key: '1s', label: '1 semana', days: 5    },
      { key: '1m', label: '1 mes',    days: 21   },
      { key: '3m', label: '3 meses',  days: 63   },
      { key: '6m', label: '6 meses',  days: 126  },
      { key: '1a', label: '1 año',    days: 252  },
      { key: '2a', label: '2 años',   days: 504  },
      { key: '5a', label: '5 años',   days: 1260 },
    ];

    const N_SIMS = 2000;
    const pctile = (arr: number[], pct: number) =>
      arr[Math.min(Math.floor(pct / 100 * N_SIMS), N_SIMS - 1)];

    const projections = HORIZONS.map(({ key, label, days }) => {
      const vals: number[] = [];
      for (let s = 0; s < N_SIMS; s++) {
        // Geometric Brownian Motion: S(T) = S0 * exp((μ - σ²/2)*T + σ*√T*Z)
        const logR = (mu - sigma2 / 2) * days + sigma * Math.sqrt(days) * boxMuller();
        vals.push(currentPrice * Math.exp(logR) * shares);
      }
      vals.sort((a, b) => a - b);

      const ret = (v: number) => ((v - investUsd) / investUsd * 100);
      return {
        key, label, days,
        p5:  +pctile(vals, 5).toFixed(2),
        p25: +pctile(vals, 25).toFixed(2),
        p50: +pctile(vals, 50).toFixed(2),
        p75: +pctile(vals, 75).toFixed(2),
        p95: +pctile(vals, 95).toFixed(2),
        retP50: +ret(pctile(vals, 50)).toFixed(2),
        retP25: +ret(pctile(vals, 25)).toFixed(2),
        retP75: +ret(pctile(vals, 75)).toFixed(2),
        probProfit: +(vals.filter(v => v > investUsd).length / N_SIMS * 100).toFixed(1),
      };
    });

    res.json({
      symbol: symbol.toUpperCase(),
      currentPrice: +currentPrice.toFixed(4),
      investment: investUsd,
      shares: +shares.toFixed(6),
      annualReturn: +(mu * 252 * 100).toFixed(2),
      annualVol:    +(sigma * Math.sqrt(252) * 100).toFixed(2),
      dataPoints: n,
      projections,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
