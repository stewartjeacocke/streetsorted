import type { AppConfig } from '../config.js';
import type { NearbyQuery, NearbyResult } from '../domain/nearby-report.js';
import { fetchNearbyReports } from '../adapters/love-clean-streets/nearby-reports.js';
export class NearbyReportsService {
  constructor(private readonly config: AppConfig) {}
  async lookup(query: NearbyQuery): Promise<NearbyResult> {
    const reports = await fetchNearbyReports(query, this.config);
    if (reports === null)
      return {
        state: 'unavailable',
        residentMessage: 'Nearby reports could not be retrieved. Please try again.',
      };
    return reports.length
      ? { state: 'reports-found', reports }
      : { state: 'no-results', reports: [] };
  }
}
