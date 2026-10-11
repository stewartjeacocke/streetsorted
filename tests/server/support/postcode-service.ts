import type { PostcodeLookup } from '../../../src/server/adapters/postcode-lookup/postcodes-io.js';
import { PostcodeLocationService } from '../../../src/server/services/postcode-location-service.js';

const locations: Record<string, { postcode: string; latitude: number; longitude: number }> = {
  N19PF: { postcode: 'N1 9PF', latitude: 51.538, longitude: -0.102 },
  N11AA: { postcode: 'N1 1AA', latitude: 51.65, longitude: -0.102 },
  N11AB: { postcode: 'N1 1AB', latitude: 51.7, longitude: -0.102 },
  N11AC: { postcode: 'N1 1AC', latitude: 51.51, longitude: -0.102 },
  N11AD: { postcode: 'N1 1AD', latitude: 51.8, longitude: -0.102 },
  N11AE: { postcode: 'N1 1AE', latitude: 51.9, longitude: -0.102 },
};

export function testPostcodeLocationService() {
  const lookup: PostcodeLookup = {
    async lookup(postcode) {
      const location = locations[postcode];
      return location ? { state: 'resolved', location } : { state: 'not-found' };
    },
    async suggest(latitude) {
      if (latitude === 51.65) return { state: 'suggested', postcode: 'N1 1AA' };
      return { state: 'not-found' };
    },
  };
  return new PostcodeLocationService(lookup);
}
