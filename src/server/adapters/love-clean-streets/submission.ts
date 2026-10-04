import type { AppConfig } from '../../config.js';
import type { CouncilProfile } from '../../domain/council.js';
function defaultCouncil(config: AppConfig): CouncilProfile {
  return {
    id: 'islington',
    displayName: 'Islington Council',
    authorityLookupIdentifiers: ['islington'],
    active: true,
    targetBaseUrl: config.TARGET_BASE_URL,
    nearbyReportsBaseUrl: config.NEARBY_REPORTS_BASE_URL,
    flyTippingCategoryId: 16144,
    outOfAreaMessage: 'This location is outside Islington and was not submitted.',
    anonymousSubmissionAvailable: true,
    councilSubmissionUrl: 'https://www.islington.gov.uk/cleaning-and-recycling/report-a-problem',
  };
}
import type { ReportDraft, SubmissionOutcome } from '../../domain/report.js';
import { createTargetClient } from './client.js';
import { parseOutcome } from './outcome.js';
import { startAnonymousSession } from './session.js';
export async function submitToLoveCleanStreets(
  draft: ReportDraft,
  councilOrConfig: CouncilProfile | AppConfig,
  maybeConfig?: AppConfig,
): Promise<SubmissionOutcome> {
  const config = maybeConfig ?? (councilOrConfig as AppConfig);
  const council = maybeConfig ? (councilOrConfig as CouncilProfile) : defaultCouncil(config);
  if (!Number.isInteger(council.flyTippingCategoryId) || council.flyTippingCategoryId <= 0)
    return {
      state: 'failed',
      reference: null,
      residentMessage: `It is not possible to submit a report to ${council.displayName} through this service.`,
      retryAllowed: false,
    };
  try {
    const { client } = createTargetClient(council.targetBaseUrl);
    const form = await startAnonymousSession(client);
    const data = new URLSearchParams({
      ...form.fields,
      __RequestVerificationToken: form.token,
      CategoryId: String(council.flyTippingCategoryId),
      Latitude: String(draft.location.latitude),
      Longitude: String(draft.location.longitude),
      formattedAddress: `Browser location (${draft.location.latitude.toFixed(5)}, ${draft.location.longitude.toFixed(5)})`,
      Notes: draft.description,
    });
    const response = await client.post(form.action, data.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 0,
    });
    return parseOutcome(
      response.status,
      typeof response.data === 'string' ? response.data : '',
      council,
    );
  } catch {
    return {
      state: 'unconfirmed',
      reference: null,
      residentMessage: `We could not confirm that the report was submitted to ${council.displayName}.`,
      retryAllowed: true,
    };
  }
}
