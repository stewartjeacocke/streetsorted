import type { AddressInfo } from 'node:net';
import { describe, expect, it } from 'vitest';
import { createMockTarget } from '../support/mock-target.js';
import { loadConfig } from '../../../src/server/config.js';
import { submitToLoveCleanStreets } from '../../../src/server/adapters/love-clean-streets/submission.js';

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
describe('Love Clean Streets adapter', () => {
  it('boots an anonymous session and submits hard-coded category 16144', async () =>
    withMock(async (target) => {
      const outcome = await submitToLoveCleanStreets(
        draft,
        loadConfig({
          PORT: '3000',
          FRONTEND_ORIGIN: 'http://localhost:4000',
          TARGET_BASE_URL: target,
          RATE_LIMIT_WINDOW_MS: '60000',
          RATE_LIMIT_MAX: '10',
        }),
      );
      expect(outcome).toMatchObject({
        state: 'confirmed',
        reference: 'MOCK-100',
        retryAllowed: false,
      });
    }));
  it('returns an out-of-area failure without retry', async () =>
    withMock(async (target) => {
      const outcome = await submitToLoveCleanStreets(
        { ...draft, description: 'outside' },
        loadConfig({
          PORT: '3000',
          FRONTEND_ORIGIN: 'http://localhost:4000',
          TARGET_BASE_URL: target,
          RATE_LIMIT_WINDOW_MS: '60000',
          RATE_LIMIT_MAX: '10',
        }),
      );
      expect(outcome).toMatchObject({ state: 'failed', retryAllowed: false });
      expect(outcome.residentMessage).toMatch(/outside Islington/i);
    }));
  it('treats ambiguous target output as unconfirmed', async () =>
    withMock(async (target) => {
      const outcome = await submitToLoveCleanStreets(
        { ...draft, description: 'ambiguous' },
        loadConfig({
          PORT: '3000',
          FRONTEND_ORIGIN: 'http://localhost:4000',
          TARGET_BASE_URL: target,
          RATE_LIMIT_WINDOW_MS: '60000',
          RATE_LIMIT_MAX: '10',
        }),
      );
      expect(outcome).toMatchObject({ state: 'unconfirmed', reference: null, retryAllowed: true });
    }));
});
