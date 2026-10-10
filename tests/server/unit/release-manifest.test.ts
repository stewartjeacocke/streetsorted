import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  optionalSourceRevision,
  sourceRevision,
  writeReleaseManifest,
} from '../../../src/server/release-manifest.js';

describe('release manifest', () => {
  it('writes artifact identity with an optional source revision', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'manifest-'));
    try {
      await writeReleaseManifest(directory, 'server');
      assert.deepEqual(JSON.parse(await readFile(join(directory, 'release.json'), 'utf8')), {
        artifactType: 'server',
      });
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

  it('requires SOURCE_REVISION only when requested by a static build', () => {
    assert.throws(() => sourceRevision({}));
    assert.equal(optionalSourceRevision({}), undefined);
    assert.equal(optionalSourceRevision({ SOURCE_REVISION: '  ' }), undefined);
    assert.equal(optionalSourceRevision({ SOURCE_REVISION: ' abc123 ' }), 'abc123');
  });
});
