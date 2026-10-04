import type { AddressInfo } from 'node:net';
import { describe, expect, it } from 'vitest';
import { createMockTarget } from '../support/mock-target.js';
import { loadConfig } from '../../../src/server/config.js';
import { fetchNearbyReports } from '../../../src/server/adapters/love-clean-streets/nearby-reports.js';
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
    FRONTEND_ORIGIN: 'http://localhost:4000',
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
      expect(reports).toEqual([
        expect.objectContaining({
          id: 'nearby-1',
          categoryName: 'Dumped or flytipped waste',
          description: 'Approved waste report',
        }),
      ]);
      expect(reports?.[0]).not.toHaveProperty('Latitude');
    }));
  it('returns empty when all records are closed or unrelated', async () =>
    withMock(async (base) => {
      expect(
        await fetchNearbyReports({ latitude: 51.65, longitude: -0.102 }, config(base)),
      ).toEqual([]);
    }));
  it('excludes missing or invalid classification and handles unavailable target', async () =>
    withMock(async (base) => {
      expect(
        await fetchNearbyReports({ latitude: 51.66, longitude: -0.102 }, config(base)),
      ).toEqual([]);
      expect(
        await fetchNearbyReports({ latitude: 51.7, longitude: -0.102 }, config(base)),
      ).toBeNull();
    }));
});
