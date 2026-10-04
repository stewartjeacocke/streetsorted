import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { describe, it } from 'node:test';
import { fetchNearbyReports } from '../../../src/server/adapters/love-clean-streets/nearby-reports.js';
import { loadConfig } from '../../../src/server/config.js';
import { createMockTarget } from '../support/mock-target.js';

async function withMock(run: (base: string) => Promise<void>) {
  const server = createMockTarget().listen(0);
  try {
    await run(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

const config = (base: string) =>
  loadConfig({
    PORT: '3000',
    FRONTEND_ORIGIN: 'http://localhost:3000',
    TARGET_BASE_URL: base,
    NEARBY_REPORTS_BASE_URL: base,
    NEARBY_REPORTS_DAYS: '30',
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX: '10',
  });

describe('nearby reports adapter', () => {
  it('keeps only active fly-tipping reports in target order and removes unsafe fields', async () =>
    withMock(async (base) => {
      const reports = await fetchNearbyReports(
        { latitude: 51.538, longitude: -0.102 },
        config(base),
      );
      assert.equal(reports?.length, 1);
      assert.partialDeepStrictEqual(reports?.[0], {
        id: 'nearby-1',
        categoryName: 'Dumped or flytipped waste',
        description: 'Approved waste report',
      });
      assert.equal(Object.hasOwn(reports?.[0] ?? {}, 'Latitude'), false);
    }));

  it('returns empty when all records are closed or unrelated', async () =>
    withMock(async (base) => {
      assert.deepEqual(
        await fetchNearbyReports({ latitude: 51.65, longitude: -0.102 }, config(base)),
        [],
      );
    }));

  it('excludes missing or invalid classification and handles unavailable target', async () =>
    withMock(async (base) => {
      assert.deepEqual(
        await fetchNearbyReports({ latitude: 51.66, longitude: -0.102 }, config(base)),
        [],
      );
      assert.equal(
        await fetchNearbyReports({ latitude: 51.7, longitude: -0.102 }, config(base)),
        null,
      );
    }));
});
