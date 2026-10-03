import type { NextFunction, Request, Response } from 'express';
import type { AppConfig } from '../config.js';

export function submissionRateLimit(config: AppConfig, maximum = config.RATE_LIMIT_MAX) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const current = hits.get(key);
    const entry =
      !current || current.resetAt <= now
        ? { count: 0, resetAt: now + config.RATE_LIMIT_WINDOW_MS }
        : current;
    entry.count += 1;
    hits.set(key, entry);
    if (entry.count > maximum)
      return res.status(429).json({
        state: 'failed',
        reference: null,
        residentMessage: 'Too many submission attempts. Please try again later.',
        retryAllowed: true,
      });
    next();
  };
}
