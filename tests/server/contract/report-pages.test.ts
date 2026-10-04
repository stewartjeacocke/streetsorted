import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../../../src/server/app.js';
import { loadConfig } from '../../../src/server/config.js';
import { copyStaticAssets } from '../../../src/server/dev/static-assets.js';
import { createMockTarget } from '../support/mock-target.js';

async function withApp(run: (agent: ReturnType<typeof request.agent>) => Promise<void>) {
  const target = createMockTarget().listen(0);
  const base = `http://127.0.0.1:${(target.address() as AddressInfo).port}`;
  const app = createApp(
    loadConfig({
      PORT: '3000',
      FRONTEND_ORIGIN: 'http://127.0.0.1:3000',
      TARGET_BASE_URL: base,
      AUTHORITY_LOOKUP_BASE_URL: base,
      NEARBY_REPORTS_BASE_URL: base,
      NEARBY_REPORTS_DAYS: '30',
      RATE_LIMIT_WINDOW_MS: '60000',
      RATE_LIMIT_MAX: '100',
    }),
  );
  try {
    await run(request.agent(app));
  } finally {
    await new Promise<void>((resolve) => target.close(() => resolve()));
  }
}

function assertSharedDocument(html: string, locationHelper = false) {
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /<html lang="en-GB">/);
  assert.match(html, /<title>[^<]+ \| Street Sorted<\/title>/);
  assert.match(html, /<main class="page">/);
  assert.equal(/location-helper\.js/.test(html), locationHelper);
  assert.doesNotMatch(html, /id="root"|main\.js|react/i);
}

function csrf(html: string) {
  const match = html.match(/name="csrf" value="([^"]+)"/);
  assert.ok(match, 'expected CSRF token');
  return match[1];
}

async function reachDetails(agent: ReturnType<typeof request.agent>, latitude = '51.65') {
  const start = await agent.get('/report').set('Accept', 'text/html');
  const location = await agent
    .post('/report/location')
    .type('form')
    .send({ csrf: csrf(start.text), latitude, longitude: '-0.102' });
  assert.equal(location.status, 303);
  const nearby = await agent.get('/report/nearby').set('Accept', 'text/html');
  const decision = await agent
    .post('/report/nearby/decision')
    .type('form')
    .send({ csrf: csrf(nearby.text), decision: 'continue' });
  assert.equal(decision.status, 303);
  return agent.get('/report/details').set('Accept', 'text/html');
}

describe('static prototype landing page', () => {
  it('serves the generated root document with the prototype introduction and report-start link', async () => {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'street-sorted-landing-'));
    const publicDirectory = join(temporaryDirectory, 'public');
    const templatesDirectory = join(temporaryDirectory, 'views', 'templates');
    try {
      await copyStaticAssets(publicDirectory, templatesDirectory);
      const app = createApp(
        loadConfig({
          PORT: '3000',
          FRONTEND_ORIGIN: 'http://127.0.0.1:3000',
          TARGET_BASE_URL: 'http://127.0.0.1:3001',
          NEARBY_REPORTS_BASE_URL: 'http://127.0.0.1:3001',
          NEARBY_REPORTS_DAYS: '30',
          RATE_LIMIT_WINDOW_MS: '60000',
          RATE_LIMIT_MAX: '100',
        }),
        { staticDirectory: publicDirectory },
      );

      const response = await request(app).get('/').set('Accept', 'text/html');

      assert.equal(response.status, 200);
      assert.match(response.text, /Street Sorted is a prototype for reporting fly-tipping/);
      assert.match(
        response.text,
        /<a class="primary-action" href="\/report">Start a new report<\/a>/,
      );
      assertSharedDocument(response.text);
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });
});

describe('server-rendered report pages', () => {
  it('renders start page with secure session cookie and manual form', async () =>
    withApp(async (agent) => {
      const response = await agent.get('/report').set('Accept', 'text/html');
      assert.equal(response.status, 200);
      assert.match(response.text, /<form method="post" action="\/report\/location">/);
      assert.match(response.headers['set-cookie'].join(';'), /HttpOnly/);
      assert.match(response.headers['set-cookie'].join(';'), /SameSite=Lax/);
      assertSharedDocument(response.text, true);
    }));

  it('keeps validation feedback on the server-rendered location page', async () =>
    withApp(async (agent) => {
      const start = await agent.get('/report');
      const response = await agent
        .post('/report/location')
        .type('form')
        .send({ csrf: csrf(start.text), latitude: 'bad', longitude: '' });
      assert.equal(response.status, 200);
      assert.match(response.text, /Enter a valid latitude/);
      assert.match(response.text, /Enter a longitude/);
    }));

  it('completes a no-JavaScript manual report submission', async () =>
    withApp(async (agent) => {
      const details = await reachDetails(agent);
      const reviewRedirect = await agent
        .post('/report/details')
        .type('form')
        .send({ csrf: csrf(details.text), description: 'Waste beside bins' });
      assert.equal(reviewRedirect.status, 303);
      const review = await agent.get('/report/review');
      const outcome = await agent
        .post('/report/submit')
        .type('form')
        .send({ csrf: csrf(review.text), confirmed: 'yes' });
      assert.equal(outcome.status, 200);
      assert.match(outcome.text, /Your report was submitted/);
      assert.match(outcome.text, /MOCK-100/);
      assertSharedDocument(outcome.text);
    }));

  it('shows nearby reports and exits without submitting when a match is selected', async () =>
    withApp(async (agent) => {
      const start = await agent.get('/report');
      await agent
        .post('/report/location')
        .type('form')
        .send({ csrf: csrf(start.text), latitude: '51.538', longitude: '-0.102' });
      const nearby = await agent.get('/report/nearby');
      assert.match(nearby.text, /Dumped or flytipped waste/);
      const outcome = await agent
        .post('/report/nearby/decision')
        .type('form')
        .send({ csrf: csrf(nearby.text), decision: 'match' });
      assert.match(outcome.text, /No new report was submitted/);
      assertSharedDocument(outcome.text);
    }));

  it('rejects missing CSRF tokens and missing report drafts', async () =>
    withApp(async (agent) => {
      const csrfFailure = await agent
        .post('/report/location')
        .type('form')
        .send({ latitude: '51.5', longitude: '-0.1' });
      assert.equal(csrfFailure.status, 409);
      const direct = await request(agent.app).get('/report/review').set('Accept', 'text/html');
      assert.equal(direct.status, 409);
      assert.match(direct.text, /Start a new report/);
      assertSharedDocument(direct.text);
    }));
});

async function reachReview(
  agent: ReturnType<typeof request.agent>,
  description = 'Waste beside bins',
) {
  const details = await reachDetails(agent);
  await agent
    .post('/report/details')
    .type('form')
    .send({ csrf: csrf(details.text), description });
  return agent.get('/report/review');
}

describe('report-page recovery and retry behavior', () => {
  it('renders nearby unavailability and permits retry without exposing a draft in the URL', async () =>
    withApp(async (agent) => {
      const start = await agent.get('/report');
      await agent
        .post('/report/location')
        .type('form')
        .send({ csrf: csrf(start.text), latitude: '51.7', longitude: '-0.102' });
      const unavailable = await agent.get('/report/nearby');
      assert.match(unavailable.text, /Nearby reports could not be retrieved/);
      assert.match(unavailable.text, /action="\/report\/nearby\/retry"/);
      const retry = await agent
        .post('/report/nearby/retry')
        .type('form')
        .send({ csrf: csrf(unavailable.text) });
      assert.equal(retry.status, 303);
    }));

  it('clears the draft on cancellation and retains it for a retryable outcome', async () =>
    withApp(async (agent) => {
      const review = await reachReview(agent, 'ambiguous');
      const outcome = await agent
        .post('/report/submit')
        .type('form')
        .send({ csrf: csrf(review.text), confirmed: 'yes' });
      assert.match(outcome.text, /could not confirm/);
      assert.match(outcome.text, /Try submission again/);

      const retried = await agent
        .post('/report/submit/retry')
        .type('form')
        .send({ csrf: csrf(outcome.text), confirmed: 'yes' });
      assert.equal(retried.status, 200);
      assert.match(retried.text, /could not confirm/);
      assert.doesNotMatch(retried.text, /Review a current location/);

      const canceled = await agent
        .post('/report/cancel')
        .type('form')
        .send({ csrf: csrf(outcome.text) });
      assert.equal(canceled.status, 303);
      const reviewAfterCancel = await agent.get('/report/review').set('Accept', 'text/html');
      assert.equal(reviewAfterCancel.status, 409);
    }));
});
