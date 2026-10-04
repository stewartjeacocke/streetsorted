import { Router, type Request, type Response } from 'express';
import type { AppConfig } from '../config.js';
import {
  descriptionFormSchema,
  formErrors,
  locationFormSchema,
} from '../domain/report-page-forms.js';
import { isFreshLocation } from '../domain/report.js';
import {
  clearReportSession as clearCookie,
  csrfIsValid,
  reportSessionId,
  setReportSession,
} from '../middleware/report-session.js';
import { NearbyReportsService } from '../services/nearby-reports-service.js';
import {
  ReportDraftSessionStore,
  type ReportDraftSession,
} from '../services/report-draft-session-store.js';
import { ReportSubmissionService } from '../services/report-submission-service.js';
import {
  detailsPage,
  locationPage,
  nearbyPage,
  outcomePage,
  recovery,
  reviewPage,
} from '../views/report-pages.js';

type Dependencies = {
  store?: ReportDraftSessionStore;
  nearbyService?: NearbyReportsService;
  submissionService?: ReportSubmissionService;
};

function html(res: Response, content: string, status = 200) {
  return res.status(status).type('html').send(content);
}

function validPost(req: Request, res: Response, draft: ReportDraftSession | null) {
  if (!draft) {
    html(res, recovery('Your report session has expired. Start a new report.'), 409);
    return false;
  }
  if (!csrfIsValid(draft, req.body.csrf)) {
    html(res, recovery('This form is no longer valid. Start a new report.'), 403);
    return false;
  }
  return true;
}

function requireDraft(req: Request, res: Response, store: ReportDraftSessionStore) {
  const draft = store.get(reportSessionId(req));
  if (!draft) html(res, recovery('Your report session has expired. Start a new report.'), 409);
  return draft;
}

function clear(res: Response, store: ReportDraftSessionStore, draft: ReportDraftSession) {
  store.clear(draft.id);
  clearCookie(res);
}

export function reportPagesRouter(config: AppConfig, dependencies: Dependencies = {}) {
  const router = Router();
  const store = dependencies.store ?? new ReportDraftSessionStore();
  const nearbyService = dependencies.nearbyService ?? new NearbyReportsService(config);
  const submissionService = dependencies.submissionService ?? new ReportSubmissionService(config);

  router.use((_req, _res, next) => {
    store.cleanup();
    next();
  });

  router.get('/', (req, res) => {
    const existing = store.get(reportSessionId(req));
    const draft = existing ?? store.create();
    if (!existing) setReportSession(res, draft);
    return html(res, locationPage(draft));
  });

  router.post('/location', async (req, res) => {
    const draft = requireDraft(req, res, store);
    if (!draft || !validPost(req, res, draft)) return;
    const parsed = locationFormSchema.safeParse(req.body);
    if (!parsed.success) return html(res, locationPage(draft, formErrors(parsed.error), req.body));
    store.update(draft, {
      stage: 'nearby',
      location: { ...parsed.data, capturedAt: new Date().toISOString() },
      description: undefined,
      nearby: undefined,
    });
    return res.redirect(303, '/report/nearby');
  });

  router.get('/nearby', async (req, res) => {
    const draft = requireDraft(req, res, store);
    if (!draft) return;
    if (!draft.location || draft.stage !== 'nearby')
      return html(res, recovery('Complete the location step before checking nearby reports.'), 409);
    const result = await nearbyService.lookup(draft.location);
    store.update(draft, { nearby: result });
    return html(res, nearbyPage(draft, result));
  });

  router.post('/nearby/retry', (req, res) => {
    const draft = requireDraft(req, res, store);
    if (!draft || !validPost(req, res, draft) || draft.stage !== 'nearby') return;
    return res.redirect(303, '/report/nearby');
  });

  router.post('/nearby/decision', (req, res) => {
    const draft = requireDraft(req, res, store);
    if (!draft || !validPost(req, res, draft) || draft.stage !== 'nearby') return;
    if (req.body.decision === 'match') {
      clear(res, store, draft);
      return html(
        res,
        outcomePage(
          'You indicated that a nearby report already matches this issue. No new report was submitted.',
        ),
      );
    }
    if (req.body.decision !== 'continue')
      return html(
        res,
        nearbyPage(
          draft,
          draft.nearby ?? { state: 'unavailable', residentMessage: 'Please retry nearby reports.' },
        ),
        400,
      );
    store.update(draft, { stage: 'details' });
    return res.redirect(303, '/report/details');
  });

  router.get('/details', (req, res) => {
    const draft = requireDraft(req, res, store);
    if (!draft) return;
    if (!draft.location || draft.stage !== 'details')
      return html(res, recovery('Complete the nearby-report step before adding details.'), 409);
    return html(res, detailsPage(draft));
  });

  router.post('/details', (req, res) => {
    const draft = requireDraft(req, res, store);
    if (!draft || !validPost(req, res, draft) || draft.stage !== 'details') return;
    const parsed = descriptionFormSchema.safeParse(req.body);
    if (!parsed.success)
      return html(
        res,
        detailsPage(draft, formErrors(parsed.error), String(req.body.description ?? '')),
      );
    store.update(draft, { stage: 'review', description: parsed.data.description });
    return res.redirect(303, '/report/review');
  });

  router.get('/review', (req, res) => {
    const draft = requireDraft(req, res, store);
    if (!draft) return;
    if (!draft.location || !draft.description || draft.stage !== 'review')
      return html(res, recovery('Complete the report details before reviewing your report.'), 409);
    if (!isFreshLocation(draft.location))
      return html(
        res,
        recovery('Your location has expired. Start a new report to refresh it.'),
        409,
      );
    return html(res, reviewPage(draft));
  });

  router.post('/review/edit', (req, res) => {
    const draft = requireDraft(req, res, store);
    if (!draft || !validPost(req, res, draft) || draft.stage !== 'review') return;
    store.update(draft, { stage: 'details' });
    return res.redirect(303, '/report/details');
  });

  async function submit(req: Request, res: Response) {
    const draft = requireDraft(req, res, store);
    if (
      !draft ||
      !validPost(req, res, draft) ||
      draft.stage !== 'review' ||
      !draft.location ||
      !draft.description
    )
      return;
    if (req.body.confirmed !== 'yes' || !isFreshLocation(draft.location))
      return html(
        res,
        recovery('Review a current location and explicitly confirm before submitting.'),
        409,
      );
    const outcome = await submissionService.submit({
      category: 'fly-tipping',
      location: draft.location,
      description: draft.description,
      confirmed: true,
    });
    if (outcome.state === 'unconfirmed' && outcome.retryAllowed)
      return html(
        res,
        outcomePage(outcome.residentMessage, outcome.reference, true, draft.csrfToken),
      );
    clear(res, store, draft);
    return html(res, outcomePage(outcome.residentMessage, outcome.reference));
  }

  router.post('/submit', submit);
  router.post('/submit/retry', submit);

  router.post('/cancel', (req, res) => {
    const draft = requireDraft(req, res, store);
    if (!draft || !validPost(req, res, draft)) return;
    clear(res, store, draft);
    return res.redirect(303, '/report');
  });

  return router;
}
