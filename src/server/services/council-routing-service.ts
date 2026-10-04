import type { IncidentLocation } from '../domain/report.js';
import type { AuthorityLookupResult } from '../domain/council.js';
import type { AuthorityLookup } from '../adapters/authority-lookup/mapit.js';
import { CouncilDirectory } from './council-directory.js';
export class CouncilRoutingService {
  constructor(
    private readonly lookup: AuthorityLookup,
    private readonly directory: CouncilDirectory,
  ) {}
  async route(
    location: Pick<IncidentLocation, 'latitude' | 'longitude'>,
  ): Promise<AuthorityLookupResult> {
    const ids = await this.lookup.lookup(location.latitude, location.longitude);
    if (!ids) return { state: 'unavailable' };
    const council = this.directory.match(ids);
    return council ? { state: 'assigned', council } : { state: 'unsupported' };
  }
  council(id: string | undefined) {
    return this.directory.get(id);
  }
}
