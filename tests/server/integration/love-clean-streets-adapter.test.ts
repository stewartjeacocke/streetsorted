import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { describe, it } from 'node:test';
import { submitToLoveCleanStreets } from '../../../src/server/adapters/love-clean-streets/submission.js';
import { loadConfig } from '../../../src/server/config.js';
import { createMockTarget } from '../support/mock-target.js';

const draft = {
  category: 'fly-tipping' as const,
  location: { latitude: 51.5, longitude: -0.1, capturedAt: new Date().toISOString() },
  description: 'Waste beside bins',
  confirmed: true as const,
};

async function withMock(run: (url: string) => Promise<void>) {
  const server = createMockTarget().listen(0);
  try {
    await run(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

const config = (target: string) =>
  loadConfig({
    PORT: '3000',
    FRONTEND_ORIGIN: 'http://localhost:3000',
    TARGET_BASE_URL: target,
    AUTHORITY_LOOKUP_BASE_URL: target,
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX: '10',
  });

describe('Love Clean Streets adapter', () => {
  it('boots an anonymous session and submits hard-coded category 16144', async () =>
    withMock(async (target) => {
      const outcome = await submitToLoveCleanStreets(draft, config(target));
      assert.partialDeepStrictEqual(outcome, {
        state: 'confirmed',
        reference: 'MOCK-100',
        retryAllowed: false,
      });
    }));

  it('returns an out-of-area failure without retry', async () =>
    withMock(async (target) => {
      const outcome = await submitToLoveCleanStreets(
        { ...draft, description: 'outside' },
        config(target),
      );
      assert.partialDeepStrictEqual(outcome, { state: 'failed', retryAllowed: false });
      assert.match(outcome.residentMessage, /outside Islington/i);
    }));

  it('treats ambiguous target output as unconfirmed', async () =>
    withMock(async (target) => {
      const outcome = await submitToLoveCleanStreets(
        { ...draft, description: 'ambiguous' },
        config(target),
      );
      assert.partialDeepStrictEqual(outcome, {
        state: 'unconfirmed',
        reference: null,
        retryAllowed: true,
      });
    }));
});
