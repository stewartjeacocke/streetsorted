import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import Handlebars from 'handlebars';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(currentDirectory, '../../..');
const sourceDirectory = resolve(projectDirectory, 'src/server/public');
const templateSourceDirectory = resolve(projectDirectory, 'src/server/views/templates');
export const staticDirectory = resolve(projectDirectory, 'dist/server/public');
export const templateDirectory = resolve(projectDirectory, 'dist/server/views/templates');

async function renderLandingPage() {
  const handlebars = Handlebars.create();
  const [layout, index] = await Promise.all([
    readFile(resolve(templateSourceDirectory, 'layout.hbs'), 'utf8'),
    readFile(resolve(templateSourceDirectory, 'index.hbs'), 'utf8'),
  ]);
  handlebars.registerPartial('layout', layout);
  return handlebars.compile(index)({});
}

export async function copyStaticAssets(
  destination = staticDirectory,
  templatesDestination = templateDirectory,
) {
  await rm(destination, { recursive: true, force: true });
  await mkdir(dirname(destination), { recursive: true });
  await cp(sourceDirectory, destination, { recursive: true });
  await writeFile(resolve(destination, 'index.html'), await renderLandingPage());
  await rm(templatesDestination, { recursive: true, force: true });
  await mkdir(dirname(templatesDestination), { recursive: true });
  await cp(templateSourceDirectory, templatesDestination, { recursive: true });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await copyStaticAssets();
