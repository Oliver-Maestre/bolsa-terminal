import { Router, Request, Response } from 'express';
import { tradingBot } from '../services/tradingBot';

const router = Router();

// GET /api/bot/status
router.get('/status', (_req: Request, res: Response) => {
  res.json(tradingBot.getStatus());
});

// GET /api/bot/log
router.get('/log', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json(tradingBot.getLog(limit));
});

// POST /api/bot/configure
// body: { enabled?, mode?, targetSymbols?, scanInterval? }
router.post('/configure', (req: Request, res: Response) => {
  const { enabled, mode, targetSymbols, scanInterval } = req.body;

  const updates: any = {};
  if (typeof enabled === 'boolean') updates.enabled = enabled;
  if (mode && ['conservative', 'moderate', 'aggressive'].includes(mode)) updates.mode = mode;
  if (Array.isArray(targetSymbols)) updates.targetSymbols = targetSymbols;
  if (typeof scanInterval === 'number' && scanInterval >= 10) updates.scanInterval = scanInterval;

  tradingBot.configure(updates);
  res.json(tradingBot.getStatus());
});

// POST /api/bot/scan  — trigger manual scan immediately
router.post('/scan', async (_req: Request, res: Response) => {
  try {
    await tradingBot.scan();
    res.json({ success: true, log: tradingBot.getLog(10) });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// SSE stream for real-time bot log
router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let lastCount = 0;

  const send = () => {
    const log = tradingBot.getLog(100);
    if (log.length !== lastCount) {
      const newEntries = log.slice(0, log.length - lastCount);
      lastCount = log.length;
      res.write(`data: ${JSON.stringify(newEntries)}\n\n`);
    }
  };

  const interval = setInterval(send, 2000);
  // Initial state
  res.write(`data: ${JSON.stringify(tradingBot.getLog(20))}\n\n`);
  lastCount = tradingBot.getLog(100).length;

  req.on('close', () => clearInterval(interval));
});

export default router;
