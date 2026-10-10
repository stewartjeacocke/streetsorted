import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import Handlebars from 'handlebars';
import { publicCouncilProfiles } from './councils.js';
import { writeReleaseManifest } from '../server/release-manifest.js';
import { staticSiteConfig } from './config.js';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(root, 'dist/static-site');
const sharedPublicSource = resolve(root, 'src/shared/public');
const staticTemplateSource = resolve(root, 'src/static-site/templates');
const serverTemplateSource = resolve(root, 'src/server/views/templates');

export async function buildStaticSite(values = process.env, destination = out) {
  const config = staticSiteConfig(values);
  await rm(destination, { recursive: true, force: true });
  try {
    await mkdir(destination, { recursive: true });
    await cp(resolve(sharedPublicSource, 'report.css'), resolve(destination, 'report.css'));
    const handlebars = Handlebars.create();
    const [layout, index, agentsTemplate] = await Promise.all([
      readFile(resolve(serverTemplateSource, 'layout.hbs'), 'utf8'),
      readFile(resolve(serverTemplateSource, 'index.hbs'), 'utf8'),
      readFile(resolve(staticTemplateSource, 'AGENTS.md.hbs'), 'utf8'),
    ]);
    await writeFile(
      resolve(destination, 'AGENTS.md'),
      handlebars.compile(agentsTemplate)({ serverBaseUrl: config.publicServerBaseUrl }),
    );
    handlebars.registerPartial('layout', layout);
    const councils = publicCouncilProfiles(values).map((profile) => ({
      displayName: profile.displayName,
      councilSubmissionUrl: profile.councilSubmissionUrl,
      supported: profile.anonymousSubmissionAvailable,
    }));
    const html = handlebars
      .compile(index)({ councils })
      .replace('href="/report"', `href="${config.publicServerBaseUrl}/report"`);
    await writeFile(resolve(destination, 'index.html'), html);
    await writeReleaseManifest(destination, 'static-site', config.sourceRevision);
    await validateStaticSite(destination);
  } catch (error) {
    await rm(destination, { recursive: true, force: true });
    throw error;
  }
}

export async function validateStaticSite(directory: string) {
  const names = new Set(await readdir(directory));
  for (const required of ['index.html', 'report.css', 'AGENTS.md', 'release.json'])
    if (!names.has(required)) throw new Error(`Static package is missing ${required}`);
  const files = await Promise.all(
    [...names].map(
      async (name) => [name, await readFile(resolve(directory, name), 'utf8')] as const,
    ),
  );
  for (const [name, value] of files)
    if (
      name.endsWith('.hbs') ||
      /AUTHORITY_LOOKUP_API_KEY|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/i.test(value)
    )
      throw new Error(`Static package contains prohibited content: ${name}`);
  const html = await readFile(resolve(directory, 'index.html'), 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (reference.startsWith('/') && !reference.startsWith('//')) {
      const asset = reference.slice(1).split(/[?#]/, 1)[0];
      if (!names.has(asset))
        throw new Error(`Static package references missing local asset: ${asset}`);
    }
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) await buildStaticSite();
