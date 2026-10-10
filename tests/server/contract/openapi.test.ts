import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../../../src/server/app.js';
import { loadConfig } from '../../../src/server/config.js';

describe('GET /openapi.yaml', () => {
  it('publishes only the public JSON API contract', async () => {
    const response = await request(createApp(loadConfig({}))).get('/openapi.yaml');
    assert.equal(response.status, 200);
    assert.match(response.headers['content-type'], /^application\/yaml/);
    assert.match(response.text, /^openapi: 3\.1\.0/m);
    assert.match(response.text, /^ {2}\/api\/nearby-reports:/m);
    assert.match(response.text, /^ {2}\/api\/reports:/m);
    assert.match(response.text, /requestBody:\n {8}required: true/);
    assert.match(response.text, /#\/components\/responses\/NearbyUnavailable/);
    assert.doesNotMatch(
      response.text,
      /AUTHORITY_LOOKUP_API_KEY|TARGET_BASE_URL|NEARBY_REPORTS_BASE_URL/i,
    );
  });
});
