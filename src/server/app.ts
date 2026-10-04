import express from 'express';
import type { AppConfig } from './config.js';
import { requestLogger } from './middleware/logger.js';
import { apiCors, securityHeaders } from './middleware/security.js';
import { nearbyReportsRouter } from './routes/nearby-reports.js';
import { reportPagesRouter } from './routes/report-pages.js';
import { reportRouter } from './routes/reports.js';

type AppOptions = { staticDirectory?: string };

const notFound = (req: express.Request, res: express.Response) =>
  req.accepts('html')
    ? res.status(404).type('html').send('<!doctype html><title>Not found</title><p>Not found.</p>')
    : res.status(404).json({
        state: 'failed',
        reference: null,
        residentMessage: 'Not found.',
        retryAllowed: false,
      });

export function createApp(config: AppConfig, { staticDirectory }: AppOptions = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(securityHeaders());
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  app.use(requestLogger);
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  if (staticDirectory) app.use(express.static(staticDirectory));
  app.use('/report', reportPagesRouter(config));
  app.use('/api', apiCors(config));
  app.use('/api', nearbyReportsRouter(config));
  app.use('/api', reportRouter(config));
  app.use(notFound);
  app.use(
    (error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      void next;
      if (req.accepts('html'))
        return res
          .status(error.message === 'Origin is not allowed' ? 403 : 500)
          .type('html')
          .send(
            '<!doctype html><title>Service unavailable</title><p>The service could not process the request.</p>',
          );
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
