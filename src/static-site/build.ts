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
const sharedTemplateSource = resolve(root, 'src/shared/templates');

export async function buildStaticSite(values = process.env, destination = out) {
  const config = staticSiteConfig(values);
  await rm(destination, { recursive: true, force: true });
  try {
    await mkdir(destination, { recursive: true });
    await cp(resolve(sharedPublicSource, 'report.css'), resolve(destination, 'report.css'));
    const handlebars = Handlebars.create();
    const [layout, index, startingReport, agentsTemplate] = await Promise.all([
      readFile(resolve(sharedTemplateSource, 'layout.hbs'), 'utf8'),
      readFile(resolve(staticTemplateSource, 'index.hbs'), 'utf8'),
      readFile(resolve(staticTemplateSource, 'starting-report.hbs'), 'utf8'),
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
    const html = handlebars.compile(index)({
      councils,
      resourceBaseUrl: './',
      serverBaseUrl: config.publicServerBaseUrl,
      locationHelper: false,
    });
    await writeFile(resolve(destination, 'index.html'), html);
    await writeFile(
      resolve(destination, 'starting-report.html'),
      handlebars.compile(startingReport)({
        resourceBaseUrl: './',
        reportUrl: `${config.publicServerBaseUrl}/report`,
        locationHelper: false,
      }),
    );
    await writeReleaseManifest(destination, 'static-site', config.sourceRevision);
    await validateStaticSite(destination);
  } catch (error) {
    await rm(destination, { recursive: true, force: true });
    throw error;
  }
}

export async function validateStaticSite(directory: string) {
  const names = new Set(await readdir(directory));
  for (const required of [
    'index.html',
    'starting-report.html',
    'report.css',
    'AGENTS.md',
    'release.json',
  ])
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
  const htmlFiles = [...names].filter((name) => name.endsWith('.html'));
  for (const htmlFile of htmlFiles) {
    const html = await readFile(resolve(directory, htmlFile), 'utf8');
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const reference = match[1];
      if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(reference)) continue;
      const asset = reference.replace(/^\.\//, '').replace(/^\//, '').split(/[?#]/, 1)[0];
      if (asset && !names.has(asset))
        throw new Error(`Static package references missing local asset: ${asset}`);
    }
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) await buildStaticSite();
