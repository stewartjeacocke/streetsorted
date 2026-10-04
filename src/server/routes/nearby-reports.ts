import { Router } from 'express';
import type { AppConfig } from '../config.js';
import { nearbyQuerySchema } from '../domain/nearby-report.js';
import { submissionRateLimit } from '../middleware/rate-limit.js';
import { NearbyReportsService } from '../services/nearby-reports-service.js';
import { CouncilRoutingService } from '../services/council-routing-service.js';
export function nearbyReportsRouter(
  config: AppConfig,
  routing: CouncilRoutingService,
  service = new NearbyReportsService(config),
) {
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
      const routed = await routing.route(parsed.data);
      if (routed.state === 'unavailable')
        return res.status(503).json({
          state: 'unavailable',
          residentMessage: 'Council identification is temporarily unavailable. Please try again.',
        });
      if (routed.state === 'unsupported')
        return res.status(422).json({
          state: 'unavailable',
          residentMessage: 'This location cannot currently be routed to a supported council.',
        });
      const result = await service.lookup(parsed.data, routed.council);
      return res.status(result.state === 'unavailable' ? 503 : 200).json(result);
    },
  );
  return router;
}
