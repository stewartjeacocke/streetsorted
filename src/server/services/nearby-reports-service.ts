import type { AppConfig } from '../config.js';
import type { CouncilProfile } from '../domain/council.js';
import type { NearbyQuery, NearbyResult } from '../domain/nearby-report.js';
import { fetchNearbyReports } from '../adapters/love-clean-streets/nearby-reports.js';
export class NearbyReportsService {
  constructor(private readonly config: AppConfig) {}
  async lookup(query: NearbyQuery, council: CouncilProfile): Promise<NearbyResult> {
    const reports = await fetchNearbyReports(query, council, this.config);
    return reports === null
      ? {
          state: 'unavailable',
          residentMessage: 'Nearby reports could not be retrieved. Please try again.',
        }
      : reports.length
        ? { state: 'reports-found', reports }
        : { state: 'no-results', reports: [] };
  }
}
