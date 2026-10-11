import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PostcodeLocationService } from '../../../src/server/services/postcode-location-service.js';
import type { PostcodeLookup } from '../../../src/server/adapters/postcode-lookup/postcodes-io.js';

describe('postcode location service', () => {
  it('normalizes a submitted postcode before lookup and returns the canonical location', async () => {
    let requested = '';
    const lookup: PostcodeLookup = {
      async lookup(postcode) {
        requested = postcode;
        return {
          state: 'resolved',
          location: { postcode: 'N1 9PF', latitude: 51.538, longitude: -0.102 },
        };
      },
      async suggest() {
        return { state: 'not-found' };
      },
    };
    const result = await new PostcodeLocationService(lookup).resolve(' n1 9pf ');
    assert.equal(requested, 'N19PF');
    assert.deepEqual(result, {
      state: 'resolved',
      location: { postcode: 'N1 9PF', latitude: 51.538, longitude: -0.102 },
    });
  });
});
