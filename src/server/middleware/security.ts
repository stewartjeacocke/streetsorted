import cors from 'cors';
import helmet from 'helmet';
import type { AppConfig } from '../config.js';

export function securityHeaders() {
  return helmet();
}

export function apiCors(config: AppConfig) {
  return cors({
    origin(origin, callback) {
      if (!origin || origin === config.FRONTEND_ORIGIN) return callback(null, true);
      return callback(new Error('Origin is not allowed'));
    },
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type'],
  });
}

export function securityMiddleware(config: AppConfig) {
  return [securityHeaders(), apiCors(config)];
}
