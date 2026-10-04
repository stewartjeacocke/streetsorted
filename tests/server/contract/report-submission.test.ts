import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../../../src/server/app.js';
import { loadConfig } from '../../../src/server/config.js';

const config = loadConfig({
  PORT: '3000',
  FRONTEND_ORIGIN: 'https://frontend.example',
  TARGET_BASE_URL: 'http://target.example',
  RATE_LIMIT_WINDOW_MS: '60000',
  RATE_LIMIT_MAX: '10',
});
const app = createApp(config);
const valid = {
  category: 'fly-tipping',
  location: { latitude: 51.5, longitude: -0.1, capturedAt: new Date().toISOString() },
  description: 'Waste beside bins',
  confirmed: true,
};

describe('POST /api/reports contract', () => {
  for (const body of [
    { ...valid, confirmed: false },
    { ...valid, location: undefined },
    { ...valid, description: '   ' },
    { ...valid, category: 'graffiti' },
    { ...valid, location: { ...valid.location, capturedAt: '2020-01-01T00:00:00.000Z' } },
  ]) {
    it('rejects a report that violates the contract', async () => {
      const response = await request(app)
        .post('/api/reports')
        .set('Origin', config.FRONTEND_ORIGIN)
        .send(body);
      assert.equal(response.status, 400);
    });
  }
});

it('returns a confirmed outcome through the API when the mock target accepts the report', async () => {
  const { createMockTarget } = await import('../support/mock-target.js');
  const target = createMockTarget().listen(0);
  try {
    const port = (target.address() as import('node:net').AddressInfo).port;
    const appWithMock = createApp(
      loadConfig({
        PORT: '3000',
        FRONTEND_ORIGIN: 'https://frontend.example',
        TARGET_BASE_URL: `http://127.0.0.1:${port}`,
        AUTHORITY_LOOKUP_BASE_URL: `http://127.0.0.1:${port}`,
        RATE_LIMIT_WINDOW_MS: '60000',
        RATE_LIMIT_MAX: '10',
      }),
    );
    const response = await request(appWithMock)
      .post('/api/reports')
      .set('Origin', 'https://frontend.example')
      .send(valid);
    assert.equal(response.status, 200);
    assert.partialDeepStrictEqual(response.body, { state: 'confirmed', reference: 'MOCK-100' });
  } finally {
    await new Promise<void>((resolve) => target.close(() => resolve()));
  }
});
