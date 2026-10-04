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
import { CouncilRoutingService } from '../services/council-routing-service.js';
import {
  nearbyPage,
  detailsPage,
  locationPage,
  outcomePage,
  recovery,
  reviewPage,
} from '../views/report-pages.js';
type Dependencies = {
  store?: ReportDraftSessionStore;
  nearbyService?: NearbyReportsService;
  submissionService?: ReportSubmissionService;
  routingService: CouncilRoutingService;
};
const html = (res: Response, content: string, status = 200) =>
  res.status(status).type('html').send(content);
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
export function reportPagesRouter(config: AppConfig, dependencies: Dependencies) {
  const router = Router(),
    store = dependencies.store ?? new ReportDraftSessionStore(),
    nearbyService = dependencies.nearbyService ?? new NearbyReportsService(config),
    submissionService = dependencies.submissionService ?? new ReportSubmissionService(config),
    routing = dependencies.routingService;
  const council = (draft: ReportDraftSession) => routing.council(draft.councilProfileId);
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
    const location = { ...parsed.data, capturedAt: new Date().toISOString() };
    const result = await routing.route(location);
    if (result.state === 'unavailable')
      return html(
        res,
        locationPage(
          draft,
          ['Council identification is temporarily unavailable. Please try again.'],
          req.body,
          'unavailable',
        ),
        503,
      );
    if (result.state === 'unsupported')
      return html(
        res,
        locationPage(
          draft,
          ['This location cannot currently be routed to a supported council.'],
          req.body,
          'unsupported',
        ),
        422,
      );
    store.resetLocation(
      draft,
      location,
      result.council.id,
      result.council.anonymousSubmissionAvailable ? 'nearby' : 'details',
    );
    return res.redirect(
      303,
      result.council.anonymousSubmissionAvailable ? '/report/nearby' : '/report/details',
    );
  });
  router.get('/nearby', async (req, res) => {
    const draft = requireDraft(req, res, store),
      assigned = draft && council(draft);
    if (!draft) return;
    if (!draft.location || !assigned || draft.stage !== 'nearby')
      return html(res, recovery('Complete the location step before checking nearby reports.'), 409);
    const result = await nearbyService.lookup(draft.location, assigned);
    store.update(draft, { nearby: result, nearbyCouncilProfileId: assigned.id });
    return html(res, nearbyPage(draft, result, assigned.displayName));
  });
  router.post('/nearby/retry', (req, res) => {
    const draft = requireDraft(req, res, store);
    if (!draft || !validPost(req, res, draft) || draft.stage !== 'nearby' || !council(draft))
      return;
    return res.redirect(303, '/report/nearby');
  });
  router.post('/nearby/decision', (req, res) => {
    const draft = requireDraft(req, res, store),
      assigned = draft && council(draft);
    if (
      !draft ||
      !validPost(req, res, draft) ||
      draft.stage !== 'nearby' ||
      !assigned ||
      draft.nearbyCouncilProfileId !== assigned.id
    )
      return;
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
          assigned.displayName,
        ),
        400,
      );
    store.update(draft, { stage: 'details' });
    return res.redirect(303, '/report/details');
  });
  router.get('/details', (req, res) => {
    const draft = requireDraft(req, res, store),
      assigned = draft && council(draft);
    if (!draft) return;
    if (!draft.location || !assigned || draft.stage !== 'details')
      return html(res, recovery('Complete the location step before adding details.'), 409);
    return html(
      res,
      detailsPage(
        draft,
        [],
        undefined,
        assigned.displayName,
        assigned.anonymousSubmissionAvailable ? undefined : assigned.councilSubmissionUrl,
      ),
    );
  });
  router.post('/details', (req, res) => {
    const draft = requireDraft(req, res, store);
    if (!draft || !validPost(req, res, draft) || draft.stage !== 'details' || !council(draft))
      return;
    const assigned = council(draft);
    if (!assigned) return;
    if (!assigned.anonymousSubmissionAvailable)
      return html(
        res,
        detailsPage(draft, [], undefined, assigned.displayName, assigned.councilSubmissionUrl),
        409,
      );
    const parsed = descriptionFormSchema.safeParse(req.body);
    if (!parsed.success)
      return html(
        res,
        detailsPage(draft, formErrors(parsed.error), String(req.body.description ?? '')),
        400,
      );
    store.update(draft, { stage: 'review', description: parsed.data.description });
    return res.redirect(303, '/report/review');
  });
  router.get('/review', (req, res) => {
    const draft = requireDraft(req, res, store),
      assigned = draft && council(draft);
    if (!draft) return;
    if (!draft.location || !draft.description || !assigned || draft.stage !== 'review')
      return html(res, recovery('Complete the report details before reviewing your report.'), 409);
    if (!isFreshLocation(draft.location))
      return html(
        res,
        recovery('Your location has expired. Start a new report to refresh it.'),
        409,
      );
    return html(res, reviewPage(draft, assigned.displayName));
  });
  router.post('/review/edit', (req, res) => {
    const draft = requireDraft(req, res, store);
    if (!draft || !validPost(req, res, draft) || draft.stage !== 'review') return;
    store.update(draft, { stage: 'details' });
    return res.redirect(303, '/report/details');
  });
  async function submit(req: Request, res: Response) {
    const draft = requireDraft(req, res, store),
      assigned = draft && council(draft);
    if (
      !draft ||
      !validPost(req, res, draft) ||
      draft.stage !== 'review' ||
      !draft.location ||
      !draft.description ||
      !assigned
    )
      return;
    if (req.body.confirmed !== 'yes' || !isFreshLocation(draft.location))
      return html(
        res,
        recovery('Review a current location and explicitly confirm before submitting.'),
        409,
      );
    const outcome = await submissionService.submit(
      {
        category: 'fly-tipping',
        location: draft.location,
        description: draft.description,
        confirmed: true,
      },
      assigned,
    );
    if (outcome.state === 'failed' && !outcome.retryAllowed) {
      clear(res, store, draft);
      return html(res, outcomePage(outcome.residentMessage, outcome.reference));
    }
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
