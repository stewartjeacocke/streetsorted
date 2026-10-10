import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { staticSiteConfig } from '../../../src/static-site/config.js';

describe('static-site public configuration', () => {
  it('accepts a public server origin and source revision', () => {
    assert.deepEqual(
      staticSiteConfig({
        PUBLIC_SERVER_BASE_URL: 'https://reports.example.test',
        SOURCE_REVISION: 'abc123',
      }),
      { publicServerBaseUrl: 'https://reports.example.test', sourceRevision: 'abc123' },
    );
  });
  it('rejects credentials, paths, queries, fragments, and missing revisions', () => {
    for (const url of [
      'https://user:secret@reports.example.test',
      'https://reports.example.test/report',
      'https://reports.example.test/?x=1',
      'https://reports.example.test/#x',
    ])
      assert.throws(() =>
        staticSiteConfig({ PUBLIC_SERVER_BASE_URL: url, SOURCE_REVISION: 'abc123' }),
      );
    assert.throws(() =>
      staticSiteConfig({ PUBLIC_SERVER_BASE_URL: 'https://reports.example.test' }),
    );
  });
});
