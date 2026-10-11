import postcodes from 'node-postcodes.io';
import type { PostcodeLookupOutcome, SuggestedPostcodeOutcome } from '../../domain/postcode.js';

export interface PostcodeLookup {
  lookup(postcode: string): Promise<PostcodeLookupOutcome>;
  suggest(latitude: number, longitude: number): Promise<SuggestedPostcodeOutcome>;
}

type Result = { postcode?: unknown; latitude?: unknown; longitude?: unknown };
type Envelope = { status?: unknown; result?: unknown };
const coordinates = (value: unknown) => {
  const result = value as Result | undefined;
  const latitude = result?.latitude;
  const longitude = result?.longitude;
  const postcode = result?.postcode;
  return typeof postcode === 'string' &&
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude)
    ? { postcode, latitude, longitude }
    : null;
};

export class PostcodesIoLookup implements PostcodeLookup {
  constructor(private readonly client = postcodes) {}

  async lookup(postcode: string): Promise<PostcodeLookupOutcome> {
    try {
      const response = (await this.client.lookup(postcode)) as Envelope;
      if (response.status === 404) return { state: 'not-found' };
      const location = response.status === 200 ? coordinates(response.result) : null;
      return location ? { state: 'resolved', location } : { state: 'unavailable' };
    } catch {
      return { state: 'unavailable' };
    }
  }

  async suggest(latitude: number, longitude: number): Promise<SuggestedPostcodeOutcome> {
    try {
      const response = (await this.client.geo(latitude, longitude, { limit: 1 })) as Envelope;
      const results = Array.isArray(response.result) ? response.result : [];
      const nearest = results[0] as Result | undefined;
      return response.status === 200 && typeof nearest?.postcode === 'string'
        ? { state: 'suggested', postcode: nearest.postcode }
        : response.status === 404
          ? { state: 'not-found' }
          : { state: 'unavailable' };
    } catch {
      return { state: 'unavailable' };
    }
  }
}
