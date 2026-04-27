import { Router, Request, Response } from 'express';
import { broker } from '../services/paperBroker';
import { getQuoteAggregated } from '../services/dataAggregator';
import { getMockQuote } from '../services/mockData';

const router = Router();

// GET /api/broker/account
router.get('/account', (_req: Request, res: Response) => {
  res.json(broker.getAccount());
});

// POST /api/broker/order
// body: { symbol, side, quantity, useMarketPrice? }
router.post('/order', async (req: Request, res: Response) => {
  const { symbol, side, quantity, price: bodyPrice } = req.body;

  if (!symbol || !side || !quantity) {
    return res.status(400).json({ error: 'symbol, side, quantity son requeridos' });
  }
  if (!['BUY', 'SELL'].includes(side)) {
    return res.status(400).json({ error: 'side debe ser BUY o SELL' });
  }
  const qty = parseFloat(quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'quantity debe ser un número positivo' });
  }

  // Resolve price
  let price: number = bodyPrice ? parseFloat(bodyPrice) : 0;
  if (!price || isNaN(price)) {
    // Fetch current market price
    try {
      const result = await getQuoteAggregated(symbol.toUpperCase());
      price = result?.data?.regularMarketPrice ?? 0;
    } catch { /* */ }
    if (!price) {
      const mock = getMockQuote(symbol.toUpperCase());
      price = mock?.regularMarketPrice ?? 0;
    }
  }
  if (!price) return res.status(400).json({ error: 'No se pudo obtener el precio de mercado' });

  const { stopLoss, takeProfit } = req.body;
  let result: any;

  if (side === 'BUY') {
    result = broker.buy(symbol.toUpperCase(), qty, price, 'MANUAL', req.body.reason, stopLoss, takeProfit);
  } else {
    result = broker.sell(symbol.toUpperCase(), qty, price, 'MANUAL', req.body.reason);
  }

  if (!result.success) return res.status(400).json({ error: result.error });
  res.json({ order: result.order, account: broker.getAccount() });
});

// POST /api/broker/sell-all/:symbol
router.post('/sell-all/:symbol', async (req: Request, res: Response) => {
  const sym = req.params.symbol.toUpperCase();

  let price = 0;
  try {
    const result = await getQuoteAggregated(sym);
    price = result?.data?.regularMarketPrice ?? 0;
  } catch { /* */ }
  if (!price) {
    const mock = getMockQuote(sym);
    price = mock?.regularMarketPrice ?? 0;
  }
  if (!price) return res.status(400).json({ error: 'No se pudo obtener precio' });

  const result = broker.sellAll(sym, price, 'MANUAL', 'Venta total manual');
  if (!result.success) return res.status(400).json({ error: result.error });
  res.json({ order: result.order, account: broker.getAccount() });
});

// GET /api/broker/orders
router.get('/orders', (_req: Request, res: Response) => {
  const account = broker.getAccount();
  res.json(account.orders);
});

// POST /api/broker/reset
router.post('/reset', (_req: Request, res: Response) => {
  broker.reset();
  res.json({ success: true, account: broker.getAccount() });
});

export default router;
