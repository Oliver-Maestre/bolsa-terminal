import { Request, Response, NextFunction } from 'express';

/**
 * Shared-token auth for a single-user deployment. If API_TOKEN is unset
 * (local dev), requests pass through unauthenticated.
 */
export function requireApiToken(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.API_TOKEN;
  if (!expected) return next();

  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.header('x-api-key');

  if (token !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}
