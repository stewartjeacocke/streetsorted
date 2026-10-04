import axios from 'axios';
import type { AppConfig } from '../../config.js';
import {
  isRelevantNearbyReport,
  type NearbyQuery,
  type NearbyReportSummary,
  type RawNearbyReport,
} from '../../domain/nearby-report.js';

function toSafeSummary(report: RawNearbyReport): NearbyReportSummary | null {
  if (!isRelevantNearbyReport(report) || typeof report.Id !== 'string' || !report.Id) return null;
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
  config: AppConfig,
): Promise<NearbyReportSummary[] | null> {
  try {
    const response = await axios.get(
      `${config.NEARBY_REPORTS_BASE_URL}/v2.svc/reports/nearby/${query.latitude},${query.longitude}`,
      {
        params: { approvedonly: 'false', days: config.NEARBY_REPORTS_DAYS },
        timeout: 10_000,
        validateStatus: (status) => status >= 200 && status < 300,
      },
    );
    if (!Array.isArray(response.data)) return null;
    return (response.data as RawNearbyReport[])
      .map(toSafeSummary)
      .filter((report): report is NearbyReportSummary => report !== null);
  } catch {
    return null;
  }
}
