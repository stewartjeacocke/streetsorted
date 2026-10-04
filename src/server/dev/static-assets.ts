import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(currentDirectory, '../../..');
const sourceDirectory = resolve(projectDirectory, 'src/server/public');
export const staticDirectory = resolve(projectDirectory, 'dist/server/public');

export async function copyStaticAssets(destination = staticDirectory) {
  await rm(destination, { recursive: true, force: true });
  await mkdir(dirname(destination), { recursive: true });
  await cp(sourceDirectory, destination, { recursive: true });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await copyStaticAssets();
