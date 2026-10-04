import type { NearbyResult } from '../domain/nearby-report.js';
import type { ReportDraftSession } from '../services/report-draft-session-store.js';
import { errors, escapeHtml, hiddenCsrf, page, recovery } from './html.js';

const button = (label: string) => `<button type="submit">${escapeHtml(label)}</button>`;
const coordinate = (value: number) => value.toFixed(5);

export function locationPage(
  draft: ReportDraftSession,
  messages: string[] = [],
  values: Record<string, string> = {},
) {
  return page(
    'Location',
    `<section><h2>Location required</h2><p>Enter your location to check for nearby reports. You can use the location helper if your browser supports it.</p>${errors(messages)}<form method="post" action="/report/location">${hiddenCsrf(draft.csrfToken)}<label>Latitude<input name="latitude" inputmode="decimal" value="${escapeHtml(values.latitude)}" required></label><label>Longitude<input name="longitude" inputmode="decimal" value="${escapeHtml(values.longitude)}" required></label>${button('Check nearby reports')}</form></section>`,
    { locationHelper: true },
  );
}

export function nearbyPage(draft: ReportDraftSession, result: NearbyResult) {
  const location = draft.location!;
  let content = `<p>Current lookup: ${coordinate(location.latitude)}, ${coordinate(location.longitude)}</p>`;
  if (result.state === 'reports-found') {
    content += `<ul>${result.reports.map((report) => `<li>${[report.categoryName, report.recordedAt, report.locationLabel, report.statusName, report.description].filter(Boolean).map(escapeHtml).join(' — ')}</li>`).join('')}</ul><p>Does any nearby report match the issue you want to report?</p><form method="post" action="/report/nearby/decision">${hiddenCsrf(draft.csrfToken)}<button name="decision" value="match" type="submit">Yes, a report matches</button><button name="decision" value="continue" type="submit">No, none match</button></form>`;
  } else if (result.state === 'no-results') {
    content += `<p>No nearby reports were found.</p><form method="post" action="/report/nearby/decision">${hiddenCsrf(draft.csrfToken)}<input type="hidden" name="decision" value="continue">${button('Continue to report details')}</form>`;
  } else {
    content += `<p role="alert">${escapeHtml(result.residentMessage)}</p><form method="post" action="/report/nearby/retry">${hiddenCsrf(draft.csrfToken)}${button('Retry nearby reports')}</form>`;
  }
  content += `<form method="post" action="/report/cancel">${hiddenCsrf(draft.csrfToken)}${button('Cancel')}</form>`;
  return page('Nearby reports', `<section><h2>Nearby reports</h2>${content}</section>`);
}

export function detailsPage(
  draft: ReportDraftSession,
  messages: string[] = [],
  value = draft.description ?? '',
) {
  return page(
    'Report details',
    `<section><h2>Tell us about the fly-tipping</h2><p><strong>Category:</strong> Fly-tipping</p>${errors(messages)}<form method="post" action="/report/details">${hiddenCsrf(draft.csrfToken)}<label>Description<textarea name="description" maxlength="1000" required>${escapeHtml(value)}</textarea></label>${button('Review report')}</form><form method="post" action="/report/cancel">${hiddenCsrf(draft.csrfToken)}${button('Cancel')}</form></section>`,
  );
}

export function reviewPage(draft: ReportDraftSession) {
  const location = draft.location!;
  return page(
    'Review report',
    `<section><h2>Review report</h2><dl><dt>Location</dt><dd>${coordinate(location.latitude)}, ${coordinate(location.longitude)}</dd><dt>Description</dt><dd>${escapeHtml(draft.description)}</dd></dl><form method="post" action="/report/submit">${hiddenCsrf(draft.csrfToken)}<input type="hidden" name="confirmed" value="yes">${button('Confirm submission')}</form><form method="post" action="/report/review/edit">${hiddenCsrf(draft.csrfToken)}${button('Edit report')}</form><form method="post" action="/report/cancel">${hiddenCsrf(draft.csrfToken)}${button('Cancel')}</form></section>`,
  );
}

export function outcomePage(
  message: string,
  reference?: string | null,
  retry = false,
  csrf?: string,
) {
  const retryForm =
    retry && csrf
      ? `<form method="post" action="/report/submit/retry">${hiddenCsrf(csrf)}<input type="hidden" name="confirmed" value="yes">${button('Try submission again')}</form>`
      : '';
  return page(
    'Submission outcome',
    `<section><h2>Submission outcome</h2><p>${escapeHtml(message)}</p>${reference ? `<p>Reference: ${escapeHtml(reference)}</p>` : ''}${retryForm}<p><a href="/report">Start a new report</a></p></section>`,
  );
}

export { recovery };
