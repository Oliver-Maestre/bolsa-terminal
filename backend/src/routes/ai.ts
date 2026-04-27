import { Router, Request, Response } from 'express';
import { streamChat, getAiRecommendationText, isAiAvailable } from '../services/aiService';
import { getAllRecommendations } from '../services/investmentAnalyzer';

const router = Router();

// GET /api/ai/status
router.get('/status', (_req: Request, res: Response) => {
  res.json({ available: isAiAvailable(), model: isAiAvailable() ? 'claude-opus-4-5' : 'fallback' });
});

// GET /api/ai/recommendations — algorithmic recommendations (no AI needed)
router.get('/recommendations', (_req: Request, res: Response) => {
  res.json(getAllRecommendations());
});

// GET /api/ai/recommendations-text — AI-generated full analysis
router.get('/recommendations-text', async (_req: Request, res: Response) => {
  try {
    const text = await getAiRecommendationText();
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/ai/chat — streaming chat (SSE)
// body: { messages: [{role, content}][] }
router.post('/chat', async (req: Request, res: Response) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'messages array required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    for await (const chunk of streamChat(messages)) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: (err as Error).message })}\n\n`);
  } finally {
    res.end();
  }
});

export default router;
