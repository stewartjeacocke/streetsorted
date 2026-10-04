import { Router } from 'express';
import type { AppConfig } from '../config.js';
import { reportRequestSchema } from '../domain/report.js';
import { submissionRateLimit } from '../middleware/rate-limit.js';
import { ReportSubmissionService } from '../services/report-submission-service.js';
import { CouncilRoutingService } from '../services/council-routing-service.js';
export function reportRouter(
  config: AppConfig,
  routing: CouncilRoutingService,
  service = new ReportSubmissionService(config),
) {
  const router = Router();
  router.post('/reports', submissionRateLimit(config), async (req, res) => {
    const parsed = reportRequestSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        state: 'failed',
        reference: null,
        residentMessage: 'Check the report details and confirm submission.',
        retryAllowed: false,
      });
    const routed = await routing.route(parsed.data.location);
    if (routed.state === 'unavailable')
      return res.status(503).json({
        state: 'failed',
        reference: null,
        residentMessage: 'Council identification is temporarily unavailable. Please try again.',
        retryAllowed: true,
      });
    if (routed.state === 'unsupported')
      return res.status(422).json({
        state: 'failed',
        reference: null,
        residentMessage: 'This location cannot currently be routed to a supported council.',
        retryAllowed: false,
      });
    const outcome = await service.submit(parsed.data, routed.council);
    return res.status(outcome.state === 'failed' ? 422 : 200).json(outcome);
  });
  return router;
}
