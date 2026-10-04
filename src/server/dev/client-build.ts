import { build, context, type BuildContext, type BuildOptions } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(currentDirectory, '../../..');
const clientSourceDirectory = resolve(projectDirectory, 'src/client');
export const clientDirectory = resolve(projectDirectory, 'dist/client');

const options: BuildOptions = {
  entryPoints: [resolve(clientSourceDirectory, 'main.tsx')],
  outdir: clientDirectory,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2024',
  jsx: 'automatic',
  logLevel: 'info',
};

async function copyHtml() {
  await mkdir(clientDirectory, { recursive: true });
  await cp(resolve(clientSourceDirectory, 'index.html'), resolve(clientDirectory, 'index.html'));
}

export async function buildClient() {
  await rm(clientDirectory, { recursive: true, force: true });
  await copyHtml();
  await build(options);
}

export async function watchClient(): Promise<BuildContext> {
  await rm(clientDirectory, { recursive: true, force: true });
  await copyHtml();
  const buildContext = await context(options);
  await buildContext.rebuild();
  await buildContext.watch();
  return buildContext;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await buildClient();
