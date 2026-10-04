import { Router } from 'express';
import type { AppConfig } from '../config.js';
import { nearbyQuerySchema } from '../domain/nearby-report.js';
import { submissionRateLimit } from '../middleware/rate-limit.js';
import { NearbyReportsService } from '../services/nearby-reports-service.js';
export function nearbyReportsRouter(config: AppConfig, service = new NearbyReportsService(config)) {
  const router = Router();
  router.get(
    '/nearby-reports',
    submissionRateLimit(config, config.RATE_LIMIT_MAX * 3),
    async (req, res) => {
      const parsed = nearbyQuerySchema.safeParse(req.query);
      if (!parsed.success)
        return res
          .status(400)
          .json({ state: 'unavailable', residentMessage: 'A valid location is required.' });
      const result = await service.lookup(parsed.data);
      return res.status(result.state === 'unavailable' ? 503 : 200).json(result);
    },
  );
  return router;
}
