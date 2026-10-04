import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(currentDirectory, '../../..');
const sourceDirectory = resolve(projectDirectory, 'src/server/public');
const templateSourceDirectory = resolve(projectDirectory, 'src/server/views/templates');
export const staticDirectory = resolve(projectDirectory, 'dist/server/public');
export const templateDirectory = resolve(projectDirectory, 'dist/server/views/templates');

export async function copyStaticAssets(
  destination = staticDirectory,
  templatesDestination = templateDirectory,
) {
  await rm(destination, { recursive: true, force: true });
  await mkdir(dirname(destination), { recursive: true });
  await cp(sourceDirectory, destination, { recursive: true });
  await rm(templatesDestination, { recursive: true, force: true });
  await mkdir(dirname(templatesDestination), { recursive: true });
  await cp(templateSourceDirectory, templatesDestination, { recursive: true });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await copyStaticAssets();
