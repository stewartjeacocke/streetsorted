import type { PostcodeLookup } from '../adapters/postcode-lookup/postcodes-io.js';
import {
  normalizePostcode,
  type PostcodeLookupOutcome,
  type SuggestedPostcodeOutcome,
} from '../domain/postcode.js';

export class PostcodeLocationService {
  constructor(private readonly lookup: PostcodeLookup) {}
  resolve(postcode: string): Promise<PostcodeLookupOutcome> {
    return this.lookup.lookup(normalizePostcode(postcode));
  }
  suggest(latitude: number, longitude: number): Promise<SuggestedPostcodeOutcome> {
    return this.lookup.suggest(latitude, longitude);
  }
}
