import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { buildStaticSite, validateStaticSite } from '../../../src/static-site/build.js';

describe('static-site artifact contract', () => {
  it('builds a self-contained public package with cross-origin report link', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'static-site-'));
    try {
      await buildStaticSite(
        { PUBLIC_SERVER_BASE_URL: 'https://reports.example.test', SOURCE_REVISION: 'abc123' },
        directory,
      );
      const [html, manifest, agents] = await Promise.all(
        ['index.html', 'release.json', 'AGENTS.md'].map((file) =>
          readFile(join(directory, file), 'utf8'),
        ),
      );
      await access(join(directory, 'report.css'));
      assert.match(html, /href="https:\/\/reports\.example\.test\/report"/);
      assert.match(html, /<link rel="stylesheet" href="\/report\.css">/);
      assert.doesNotMatch(html, /<script/i);
      assert.deepEqual(JSON.parse(manifest), {
        artifactType: 'static-site',
        sourceRevision: 'abc123',
      });
      assert.match(agents, /`GET\s+https:\/\/reports\.example\.test\/health`/);
      assert.match(agents, /`GET\s+https:\/\/reports\.example\.test\/api\/nearby-reports/);
      assert.match(agents, /`POST\s+https:\/\/reports\.example\.test\/api\/reports`/);
      await assert.rejects(access(join(directory, 'index.hbs')));
      await assert.rejects(access(join(directory, 'AGENTS.md.hbs')));
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
  it('rejects a generated document with a missing local asset', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'static-site-missing-'));
    try {
      await buildStaticSite(
        { PUBLIC_SERVER_BASE_URL: 'https://reports.example.test', SOURCE_REVISION: 'abc123' },
        directory,
      );
      await writeFile(join(directory, 'index.html'), '<link href="/missing.css">');
      await assert.rejects(
        () => validateStaticSite(directory),
        /missing local asset: missing\.css/,
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
