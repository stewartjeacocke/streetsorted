import type { NearbyResult } from '../domain/nearby-report.js';
import type { ReportDraftSession } from '../services/report-draft-session-store.js';
import { renderReportPage } from './renderer.js';

const coordinate = (value: number) => value.toFixed(5);

function locationDisplay(draft: ReportDraftSession) {
  const location = draft.location!;
  return `${coordinate(location.latitude)}, ${coordinate(location.longitude)}`;
}

export function locationPage(
  draft: ReportDraftSession,
  messages: string[] = [],
  values: Record<string, string> = {},
) {
  return renderReportPage('location', {
    csrfToken: draft.csrfToken,
    messages,
    latitude: values.latitude ?? '',
    longitude: values.longitude ?? '',
  });
}

export function nearbyPage(draft: ReportDraftSession, result: NearbyResult) {
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
) {
  return renderReportPage('details', {
    csrfToken: draft.csrfToken,
    messages,
    description: value,
  });
}

export function reviewPage(draft: ReportDraftSession) {
  return renderReportPage('review', {
    csrfToken: draft.csrfToken,
    locationDisplay: locationDisplay(draft),
    description: draft.description ?? '',
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
