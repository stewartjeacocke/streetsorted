import type { NearbyResult } from '../domain/nearby-report.js';
import type { ReportDraftSession } from '../services/report-draft-session-store.js';
import { renderReportPage } from './renderer.js';
const locationDisplay = (draft: ReportDraftSession) => draft.postcode ?? '';
const councilName = (draft: ReportDraftSession, name?: string) =>
  name ?? draft.councilProfileId ?? '';
export function locationPage(
  draft: ReportDraftSession,
  messages: string[] = [],
  values: Record<string, string> = {},
  status: 'normal' | 'unavailable' | 'unsupported' | 'not-found' = 'normal',
) {
  return renderReportPage('location', {
    csrfToken: draft.csrfToken,
    messages,
    postcode: values.postcode ?? '',
    routingUnavailable: status === 'unavailable',
    routingUnsupported: status === 'unsupported',
    postcodeNotFound: status === 'not-found',
  });
}
export function nearbyPage(draft: ReportDraftSession, result: NearbyResult, name?: string) {
  const reports =
    result.state === 'reports-found'
      ? result.reports.map((report) => ({
          values: [
            report.categoryName,
            report.recordedAt,
            report.locationLabel,
            report.statusName,
            report.description,
          ].filter((value): value is string => Boolean(value)),
        }))
      : [];
  return renderReportPage('nearby', {
    csrfToken: draft.csrfToken,
    locationDisplay: locationDisplay(draft),
    councilName: councilName(draft, name),
    reportsFound: result.state === 'reports-found',
    noResults: result.state === 'no-results',
    residentMessage: result.state === 'unavailable' ? result.residentMessage : '',
    reports,
  });
}
export function detailsPage(
  draft: ReportDraftSession,
  messages: string[] = [],
  value = draft.description ?? '',
  name?: string,
  councilSubmissionUrl?: string,
) {
  return renderReportPage('details', {
    csrfToken: draft.csrfToken,
    messages,
    description: value,
    councilName: councilName(draft, name),
    councilSubmissionUnavailable: Boolean(councilSubmissionUrl),
    councilSubmissionUrl: councilSubmissionUrl ?? '',
  });
}
export function reviewPage(draft: ReportDraftSession, name?: string) {
  return renderReportPage('review', {
    csrfToken: draft.csrfToken,
    locationDisplay: locationDisplay(draft),
    description: draft.description ?? '',
    councilName: councilName(draft, name),
  });
}
export function outcomePage(
  message: string,
  reference?: string | null,
  retry = false,
  csrf?: string,
) {
  return renderReportPage('outcome', {
    message,
    reference: reference ?? '',
    retry: retry && Boolean(csrf),
    csrfToken: csrf ?? '',
  });
}
export function recovery(message: string) {
  return renderReportPage('recovery', { message });
}
