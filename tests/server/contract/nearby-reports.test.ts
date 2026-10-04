import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../../src/server/app.js';
import { loadConfig } from '../../../src/server/config.js';
import { createMockTarget } from '../support/mock-target.js';
async function appWithMock() {
  const target = createMockTarget().listen(0);
  const base = `http://127.0.0.1:${(target.address() as AddressInfo).port}`;
  const config = loadConfig({
    PORT: '3000',
    FRONTEND_ORIGIN: 'https://frontend.example',
    TARGET_BASE_URL: base,
    NEARBY_REPORTS_BASE_URL: base,
    NEARBY_REPORTS_DAYS: '30',
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX: '10',
  });
  return { target, config, app: createApp(config) };
}
describe('GET /api/nearby-reports', () => {
  it('returns only active fly-tipping summaries', async () => {
    const { target, config, app } = await appWithMock();
    try {
      const response = await request(app)
        .get('/api/nearby-reports?latitude=51.538&longitude=-0.102')
        .set('Origin', config.FRONTEND_ORIGIN);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        state: 'reports-found',
        reports: [{ id: 'nearby-1' }],
      });
      expect(response.body.reports).toHaveLength(1);
    } finally {
      await new Promise<void>((r) => target.close(() => r()));
    }
  });
  it('returns no-results for all-filtered or invalid-classification records', async () => {
    const { target, config, app } = await appWithMock();
    try {
      for (const latitude of [51.65, 51.66]) {
        const response = await request(app)
          .get(`/api/nearby-reports?latitude=${latitude}&longitude=-0.102`)
          .set('Origin', config.FRONTEND_ORIGIN);
        expect(response.body).toEqual({ state: 'no-results', reports: [] });
      }
    } finally {
      await new Promise<void>((r) => target.close(() => r()));
    }
  });
  it('returns unavailable and rejects invalid locations', async () => {
    const { target, config, app } = await appWithMock();
    try {
      expect(
        (
          await request(app)
            .get('/api/nearby-reports?latitude=51.7&longitude=-0.102')
            .set('Origin', config.FRONTEND_ORIGIN)
        ).status,
      ).toBe(503);
      expect(
        (
          await request(app)
            .get('/api/nearby-reports?latitude=x&longitude=-0.102')
            .set('Origin', config.FRONTEND_ORIGIN)
        ).status,
      ).toBe(400);
    } finally {
      await new Promise<void>((r) => target.close(() => r()));
    }
  });
});
