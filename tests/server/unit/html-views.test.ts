import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import type { NearbyResult } from '../../../src/server/domain/nearby-report.js';
import { copyStaticAssets } from '../../../src/server/dev/static-assets.js';
import type { ReportDraftSession } from '../../../src/server/services/report-draft-session-store.js';
import {
  detailsPage,
  locationPage,
  nearbyPage,
  outcomePage,
  recovery,
  reviewPage,
} from '../../../src/server/views/report-pages.js';
import { createRenderer } from '../../../src/server/views/renderer.js';

function draft(overrides: Partial<ReportDraftSession> = {}): ReportDraftSession {
  return {
    id: 'draft-id',
    csrfToken: 'csrf-token',
    stage: 'review',
    location: { latitude: 51.65, longitude: -0.102, capturedAt: '2026-10-04T00:00:00.000Z' },
    description: 'Waste beside bins',
    lastActivityAt: 0,
    ...overrides,
  };
}

describe('Handlebars view renderer', () => {
  it('renders a semantic shared document layout without an SPA shell', () => {
    const render = createRenderer({
      layout:
        '<!doctype html><html lang="en-GB"><head><title>{{title}} | Street Sorted</title>{{#if locationHelper}}<script defer src="/location-helper.js"></script>{{/if}}</head><body><main class="page"><h1>Street Sorted</h1>{{> @partial-block}}</main></body></html>',
      preview:
        '{{#> layout title=title locationHelper=locationHelper}}<section><h2>{{heading}}</h2><p>{{value}}</p></section>{{/layout}}',
    });

    const output = render('preview', {
      title: 'Example',
      heading: 'Example',
      value: '<script>"&\'</script>',
      locationHelper: true,
    });

    assert.match(output, /<!doctype html>/i);
    assert.match(output, /<main class="page">/);
    assert.match(output, /<script defer src="\/location-helper\.js"><\/script>/);
    assert.match(output, /&lt;script&gt;&quot;&amp;&#x27;&lt;\/script&gt;/);
    assert.doesNotMatch(output, /id="root"|main\.js|react/i);
    assert.throws(() => render('unknown', {}), /Unknown Handlebars template/);
    assert.throws(
      () => createRenderer({ preview: '<p>Preview</p>' }),
      /Missing required Handlebars layout template/,
    );
    assert.throws(
      () => createRenderer({ layout: '{{#if value}}', preview: '<p>Preview</p>' }),
      /Parse error/,
    );
  });
});

describe('templated report pages', () => {
  it('renders the location, details, review, and outcome form contracts', () => {
    const location = locationPage(draft(), ['<img src=x onerror=alert(1)>'], {
      latitude: '51.65',
      longitude: '-0.102',
    });
    assert.match(location, /<title>Location \| Street Sorted<\/title>/);
    assert.match(location, /name="csrf" value="csrf-token"/);
    assert.match(location, /value="51\.65"/);
    assert.match(location, /<script defer src="\/location-helper\.js"><\/script>/);
    assert.match(location, /&lt;img src&#x3D;x onerror&#x3D;alert\(1\)&gt;/);

    const details = detailsPage(draft(), ['Correct the description'], '<b>Waste</b>');
    assert.match(
      details,
      /<textarea name="description" maxlength="1000" required>&lt;b&gt;Waste&lt;\/b&gt;<\/textarea>/,
    );
    assert.match(details, /Correct the description/);
    assert.match(details, /action="\/report\/cancel"/);

    const review = reviewPage(draft());
    assert.match(review, /51\.65000, -0\.10200/);
    assert.match(review, /action="\/report\/submit"/);
    assert.match(review, /name="confirmed" value="yes"/);
    assert.match(review, /action="\/report\/review\/edit"/);

    const outcome = outcomePage('Submitted', 'REF-1', true, 'retry-token');
    assert.match(outcome, /Reference: REF-1/);
    assert.match(outcome, /action="\/report\/submit\/retry"/);
    assert.match(outcome, /name="csrf" value="retry-token"/);
    assert.match(outcome, /name="confirmed" value="yes"/);
  });

  it('renders all nearby and recovery states while omitting absent report fields', () => {
    const reportsFound: NearbyResult = {
      state: 'reports-found',
      reports: [
        {
          id: 'nearby-1',
          categoryName: 'Fly-tipping',
          recordedAt: '2026-10-01',
          locationLabel: null,
          statusName: 'Open',
          description: '<b>Unsafe</b>',
        },
      ],
    };
    const found = nearbyPage(draft(), reportsFound);
    assert.match(found, /Fly-tipping — 2026-10-01 — Open — &lt;b&gt;Unsafe&lt;\/b&gt;/);
    assert.doesNotMatch(found, /null|undefined/);
    assert.match(found, /name="decision" value="match"/);
    assert.match(found, /name="decision" value="continue"/);

    const empty = nearbyPage(draft(), { state: 'no-results', reports: [] });
    assert.match(empty, /No nearby reports were found\./);
    assert.match(empty, /<input type="hidden" name="decision" value="continue">/);

    const unavailable = nearbyPage(draft(), {
      state: 'unavailable',
      residentMessage: '<script>do not run</script>',
    });
    assert.match(unavailable, /&lt;script&gt;do not run&lt;\/script&gt;/);
    assert.match(unavailable, /action="\/report\/nearby\/retry"/);

    const recoveryPage = recovery('<img src=x>');
    assert.match(recoveryPage, /role="alert">&lt;img src&#x3D;x&gt;<\/p>/);
    assert.match(recoveryPage, /<a href="\/report">Start a new report<\/a>/);
  });

  it('escapes hostile dynamic outcome values and does not render a retry without a CSRF token', () => {
    const output = outcomePage('<img src=x onerror=alert(1)>', '<script>ref</script>', true);
    assert.match(output, /&lt;img src&#x3D;x onerror&#x3D;alert\(1\)&gt;/);
    assert.match(output, /&lt;script&gt;ref&lt;\/script&gt;/);
    assert.doesNotMatch(output, /<img src=x|<script>ref<\/script>|submit\/retry/);
  });
});

describe('runtime template assets', () => {
  it('renders the private index template to public HTML without publishing template sources', async () => {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'street-sorted-assets-'));
    const publicDirectory = join(temporaryDirectory, 'public');
    const templatesDirectory = join(temporaryDirectory, 'views', 'templates');
    try {
      await copyStaticAssets(publicDirectory, templatesDirectory);

      const index = await readFile(join(publicDirectory, 'index.html'), 'utf8');
      const agentsGuide = await readFile(join(publicDirectory, 'AGENTS.md'), 'utf8');
      assert.match(index, /<!doctype html>/i);
      assert.match(index, /<main class="page">/);
      assert.match(
        index,
        /<p class="for-agents">AI agents: prefer our <a href="\/AGENTS\.md">API<\/a> when using Street Sorted\.<\/p>/,
      );
      assert.ok(index.indexOf('class="for-agents"') < index.indexOf('<h2>Report fly-tipping<'));
      assert.match(index, /<link rel="stylesheet" href="\/report\.css">/);
      assert.match(index, /Street Sorted is a prototype for reporting fly-tipping/);
      assert.match(index, /<h3>Councils<\/h3>/);
      assert.match(index, /Islington Council/);
      assert.match(index, /Lancaster City Council/);
      assert.match(index, /Street Sorted can submit a new fly-tipping report\./);
      assert.match(
        index,
        /Street Sorted cannot submit a new fly-tipping report; use the council website\./,
      );
      assert.match(index, /href="https:\/\/www\.camden\.gov\.uk\/fly-tipping-street-obstructions"/);
      assert.match(index, /<a class="primary-action" href="\/report">Start a new report<\/a>/);
      assert.doesNotMatch(index, /Handlebars\.template|precompile/i);
      assert.match(agentsGuide, /GET \/health/);
      assert.match(agentsGuide, /GET \/api\/nearby-reports/);
      assert.match(agentsGuide, /POST \/api\/reports/);
      assert.match(agentsGuide, /\/report/);
      assert.match(agentsGuide, /Use only the public/);
      assert.match(await readFile(join(templatesDirectory, 'layout.hbs'), 'utf8'), /Street Sorted/);
      await assert.rejects(access(join(publicDirectory, 'layout.hbs')));
      await assert.rejects(access(join(publicDirectory, 'index.hbs')));
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });
});

it('renders a council website link instead of a report-details form when anonymous submission is unavailable', async () => {
  const { detailsPage } = await import('../../../src/server/views/report-pages.js');
  const html = detailsPage(
    {
      id: 'draft',
      csrfToken: 'csrf',
      stage: 'details',
      councilProfileId: 'camden',
      lastActivityAt: Date.now(),
    },
    [],
    '',
    'Camden Council',
    'https://www.camden.gov.uk/fly-tipping-street-obstructions',
  );
  assert.match(
    html,
    /It is not possible to submit a report to Camden Council through this service/,
  );
  assert.match(html, /href="https:\/\/www\.camden\.gov\.uk\/fly-tipping-street-obstructions"/);
  assert.doesNotMatch(html, /action="\/report\/details"/);
});
