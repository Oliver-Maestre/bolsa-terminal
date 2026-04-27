import { Router, Request, Response } from 'express';
import { searchSymbols } from '../services/yahooFinance';

const router = Router();

// GET /api/search?q=apple
router.get('/', async (req: Request, res: Response) => {
  const q = req.query.q as string;
  if (!q || q.length < 1) return res.status(400).json({ error: 'q param required' });
  const results = await searchSymbols(q);
  res.json(results);
});

export default router;
