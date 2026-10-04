import request from 'supertest';
import { describe, expect, it } from 'vitest';
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

describe('security boundary', () => {
  it('rejects an unapproved browser origin', async () => {
    const response = await request(app)
      .post('/api/reports')
      .set('Origin', 'https://attacker.example')
      .send({});
    expect(response.status).toBe(403);
  });
  it('rejects invalid payload before target contact', async () => {
    const response = await request(app)
      .post('/api/reports')
      .set('Origin', config.FRONTEND_ORIGIN)
      .send({ category: 'fly-tipping', confirmed: false });
    expect(response.status).toBe(400);
    expect(response.body.state).toBe('failed');
  });
});
