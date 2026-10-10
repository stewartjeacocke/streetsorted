import type { NextFunction, Request, Response } from 'express';

export function redact(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const blocked =
    /description|latitude|longitude|accuracy|cookie|token|csrf|session|authorization|api[-_]?key|secret|password|credential|signature|html|body|report|address|history|image|match/i;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      blocked.test(key) ? '[REDACTED]' : redact(entry),
    ]),
  );
}
export function logEvent(event: string, fields: Record<string, unknown> = {}) {
  console.info(JSON.stringify({ event, ...(redact(fields) as Record<string, unknown>) }));
}
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const started = Date.now();
  res.on('finish', () =>
    logEvent('request_complete', {
      method: req.method,
      path: req.path,
      headers: req.headers,
      status: res.statusCode,
      durationMs: Date.now() - started,
    }),
  );
  next();
}
