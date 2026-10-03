import { describe, expect, it } from 'vitest';
import { redact } from '../../src/middleware/logger.js';

describe('redact', () => {
  it('removes report content, coordinates, cookies, and tokens', () => {
    expect(
      redact({
        description: 'private waste details',
        latitude: 51.5,
        longitude: -0.1,
        cookie: 'secret',
        token: 'secret',
        status: 200,
      }),
    ).toEqual({
      description: '[REDACTED]',
      latitude: '[REDACTED]',
      longitude: '[REDACTED]',
      cookie: '[REDACTED]',
      token: '[REDACTED]',
      status: 200,
    });
  });
});
