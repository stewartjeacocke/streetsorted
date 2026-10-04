import type { AppConfig } from '../../config.js';
import {
  flyTippingCategoryId,
  type ReportDraft,
  type SubmissionOutcome,
} from '../../domain/report.js';
import { createTargetClient } from './client.js';
import { parseOutcome } from './outcome.js';
import { startAnonymousSession } from './session.js';

export async function submitToLoveCleanStreets(
  draft: ReportDraft,
  config: AppConfig,
): Promise<SubmissionOutcome> {
  try {
    const { client } = createTargetClient(config.TARGET_BASE_URL);
    const form = await startAnonymousSession(client);
    const data = new URLSearchParams({
      ...form.fields,
      __RequestVerificationToken: form.token,
      CategoryId: String(flyTippingCategoryId),
      Latitude: String(draft.location.latitude),
      Longitude: String(draft.location.longitude),
      formattedAddress: `Browser location (${draft.location.latitude.toFixed(5)}, ${draft.location.longitude.toFixed(5)})`,
      Notes: draft.description,
    });
    const response = await client.post(form.action, data.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 0,
    });
    return parseOutcome(response.status, typeof response.data === 'string' ? response.data : '');
  } catch {
    return {
      state: 'unconfirmed',
      reference: null,
      residentMessage: 'We could not confirm that the report was submitted.',
      retryAllowed: true,
    };
  }
}
