import cors from 'cors';
import helmet from 'helmet';
import type { AppConfig } from '../config.js';

export function securityMiddleware(config: AppConfig) {
  return [
    helmet(),
    cors({
      origin(origin, callback) {
        if (!origin || origin === config.FRONTEND_ORIGIN) return callback(null, true);
        return callback(new Error('Origin is not allowed'));
      },
      methods: ['POST', 'GET'],
      allowedHeaders: ['Content-Type'],
    }),
  ];
}
