import express from 'express';
import type { AppConfig } from './config.js';
import { requestLogger } from './middleware/logger.js';
import { securityMiddleware } from './middleware/security.js';
import { reportRouter } from './routes/reports.js';
import { nearbyReportsRouter } from './routes/nearby-reports.js';

type AppOptions = { clientDirectory?: string };

const notFound = (_req: express.Request, res: express.Response) =>
  res.status(404).json({
    state: 'failed',
    reference: null,
    residentMessage: 'Not found.',
    retryAllowed: false,
  });

export function createApp(config: AppConfig, { clientDirectory }: AppOptions = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(...securityMiddleware(config));
  app.use(express.json({ limit: '16kb' }));
  app.use(requestLogger);
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', nearbyReportsRouter(config));
  app.use('/api', reportRouter(config));
  app.use('/api', notFound);

  if (clientDirectory) {
    app.use(express.static(clientDirectory));
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return notFound(req, res);
      return res.sendFile('index.html', { root: clientDirectory }, (error) => {
        if (error) next(error);
      });
    });
  } else {
    app.use(notFound);
  }

  app.use(
    (error: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
      void next;
      return res.status(error.message === 'Origin is not allowed' ? 403 : 500).json({
        state: 'failed',
        reference: null,
        residentMessage: 'The service could not process the request.',
        retryAllowed: true,
      });
    },
  );
  return app;
}
