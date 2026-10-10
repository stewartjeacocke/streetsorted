import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

describe('runtime dependencies', () => {
  it('does not retain React, JSX, or a client bundle configuration', async () => {
    const pkg = JSON.parse(await readFile('package.json', 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      scripts: Record<string, string>;
    };
    const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const name of [
      'react',
      'react-dom',
      '@types/react',
      '@types/react-dom',
      '@testing-library/react',
    ])
      assert.equal(dependencies[name], undefined);
    assert.equal(pkg.scripts['build:client'], undefined);
    assert.equal(pkg.scripts['test:client'], undefined);
    await assert.rejects(access('tsconfig.client.json'));
    await assert.rejects(access('src/client'));
    assert.equal(pkg.scripts['build:static-site'], 'tsx src/static-site/build.ts');
    assert.match(pkg.scripts['build:server'], /server-assets/);
    assert.match(pkg.scripts.build, /build:static-site/);
  });
});
