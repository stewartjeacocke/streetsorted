import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { redact } from '../../../src/server/middleware/logger.js';

describe('redact', () => {
  it('removes report content, coordinates, cookies, and tokens', () => {
    assert.deepEqual(
      redact({
        description: 'private waste details',
        latitude: 51.5,
        longitude: -0.1,
        cookie: 'secret',
        token: 'secret',
        status: 200,
      }),
      {
        description: '[REDACTED]',
        latitude: '[REDACTED]',
        longitude: '[REDACTED]',
        cookie: '[REDACTED]',
        token: '[REDACTED]',
        status: 200,
      },
    );
  });
});
