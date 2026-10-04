import axios from 'axios';
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
import {
  isRelevantNearbyReport,
  type NearbyQuery,
  type NearbyReportSummary,
  type RawNearbyReport,
} from '../../domain/nearby-report.js';
function toSafeSummary(report: RawNearbyReport, categoryId: number): NearbyReportSummary | null {
  if (!isRelevantNearbyReport(report, categoryId) || typeof report.Id !== 'string' || !report.Id)
    return null;
  return {
    id: report.Id,
    categoryName: typeof report.CategoryName === 'string' ? report.CategoryName : null,
    recordedAt: typeof report.DateTimeRecorded === 'string' ? report.DateTimeRecorded : null,
    locationLabel: typeof report.Address === 'string' ? report.Address : null,
    statusName: typeof report.StatusName === 'string' ? report.StatusName : null,
    description:
      report.Approved === true && typeof report.Description === 'string'
        ? report.Description
        : null,
  };
}
export async function fetchNearbyReports(
  query: NearbyQuery,
  councilOrConfig: CouncilProfile | AppConfig,
  maybeConfig?: AppConfig,
): Promise<NearbyReportSummary[] | null> {
  const config = maybeConfig ?? (councilOrConfig as AppConfig);
  const council = maybeConfig ? (councilOrConfig as CouncilProfile) : defaultCouncil(config);
  const categoryId = council.flyTippingCategoryId;
  if (!Number.isInteger(categoryId) || categoryId <= 0) return null;
  try {
    const response = await axios.get(
      `${council.nearbyReportsBaseUrl}/v2.svc/reports/nearby/${query.latitude},${query.longitude}`,
      {
        params: { approvedonly: 'false', days: config.NEARBY_REPORTS_DAYS },
        timeout: 10_000,
        validateStatus: (status) => status >= 200 && status < 300,
      },
    );
    if (!Array.isArray(response.data)) return null;
    return (response.data as RawNearbyReport[])
      .map((report) => toSafeSummary(report, categoryId))
      .filter((report): report is NearbyReportSummary => report !== null);
  } catch {
    return null;
  }
}
