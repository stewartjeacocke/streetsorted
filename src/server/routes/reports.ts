import { Router } from 'express';
import type { AppConfig } from '../config.js';
import { reportRequestSchema } from '../domain/report.js';
import { submissionRateLimit } from '../middleware/rate-limit.js';
import { ReportSubmissionService } from '../services/report-submission-service.js';

export function reportRouter(config: AppConfig, service = new ReportSubmissionService(config)) {
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
    const outcome = await service.submit(parsed.data);
    return res.status(outcome.state === 'failed' ? 422 : 200).json(outcome);
  });
  return router;
}
