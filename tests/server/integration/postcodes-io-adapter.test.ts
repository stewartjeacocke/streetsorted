import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PostcodesIoLookup } from '../../../src/server/adapters/postcode-lookup/postcodes-io.js';

describe('Postcodes.io adapter', () => {
  it('normalizes provider lookup and reverse-geocode envelopes', async () => {
    const client = {
      async lookup() {
        return { status: 200, result: { postcode: 'N1 9PF', latitude: 51.538, longitude: -0.102 } };
      },
      async geo() {
        return { status: 200, result: [{ postcode: 'N1 9PF' }] };
      },
    };
    const adapter = new PostcodesIoLookup(client);
    assert.deepEqual(await adapter.lookup('N19PF'), {
      state: 'resolved',
      location: { postcode: 'N1 9PF', latitude: 51.538, longitude: -0.102 },
    });
    assert.deepEqual(await adapter.suggest(51.538, -0.102), {
      state: 'suggested',
      postcode: 'N1 9PF',
    });
  });
  it('maps not-found and malformed responses safely', async () => {
    const adapter = new PostcodesIoLookup({
      async lookup() {
        return { status: 404 };
      },
      async geo() {
        return { status: 500 };
      },
    });
    assert.deepEqual(await adapter.lookup('N19PF'), { state: 'not-found' });
    assert.deepEqual(await adapter.suggest(1, 1), { state: 'unavailable' });
  });
});
