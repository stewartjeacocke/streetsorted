import assert from 'node:assert/strict';
import { access, readFile, rm } from 'node:fs/promises';
import { describe, it } from 'node:test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
describe('server artifact contract', () => {
  it('builds dynamic assets and manifest without a static landing entry document', async () => {
    await rm('dist', { recursive: true, force: true });
    await execFileAsync('npm', ['run', 'build:server'], {
      env: { ...process.env, SOURCE_REVISION: 'server-abc' },
    });
    assert.deepEqual(JSON.parse(await readFile('dist/server/release.json', 'utf8')), {
      artifactType: 'server',
      sourceRevision: 'server-abc',
    });
    await access('dist/server/public/report.css');
    await access('dist/server/public/location-helper.js');
    await access('dist/server/views/templates/layout.hbs');
    await assert.rejects(access('dist/server/views/templates/index.hbs'));
    await assert.rejects(access('dist/server/public/index.html'));
    await assert.rejects(access('dist/static-site'));
  });
});
