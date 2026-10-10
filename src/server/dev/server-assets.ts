import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeReleaseManifest } from '../release-manifest.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
export const serverDirectory = resolve(root, 'dist/server');
export const serverPublicDirectory = resolve(serverDirectory, 'public');
export async function copyServerAssets() {
  await rm(serverPublicDirectory, { recursive: true, force: true });
  await mkdir(serverPublicDirectory, { recursive: true });
  await cp(
    resolve(root, 'src/shared/public/report.css'),
    resolve(serverPublicDirectory, 'report.css'),
  );
  await cp(
    resolve(root, 'src/server/public/location-helper.js'),
    resolve(serverPublicDirectory, 'location-helper.js'),
  );
  const runtimeTemplateDirectory = resolve(serverDirectory, 'views/templates');
  await cp(resolve(root, 'src/server/views/templates'), runtimeTemplateDirectory, {
    recursive: true,
  });
  await cp(
    resolve(root, 'src/shared/templates/layout.hbs'),
    resolve(runtimeTemplateDirectory, 'layout.hbs'),
  );
  await cp(resolve(root, 'src/server/openapi.yaml'), resolve(serverDirectory, 'openapi.yaml'));
  await writeReleaseManifest(serverDirectory, 'server');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await copyServerAssets();
