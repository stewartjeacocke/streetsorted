import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { sourceRevision, writeReleaseManifest } from '../../../src/server/release-manifest.js';

describe('release manifest', () => {
  it('writes artifact identity for static and server releases', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'manifest-'));
    try {
      await writeReleaseManifest(directory, 'server', 'abc123');
      assert.deepEqual(JSON.parse(await readFile(join(directory, 'release.json'), 'utf8')), {
        artifactType: 'server',
        sourceRevision: 'abc123',
      });
      await writeReleaseManifest(directory, 'static-site', 'def456');
      assert.deepEqual(JSON.parse(await readFile(join(directory, 'release.json'), 'utf8')), {
        artifactType: 'static-site',
        sourceRevision: 'def456',
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
  it('requires SOURCE_REVISION', () => assert.throws(() => sourceRevision({})));
});
