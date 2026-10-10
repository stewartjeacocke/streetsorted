import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { z } from 'zod';

const sourceRevisionSchema = z.string().trim().min(1, 'SOURCE_REVISION is required');
export type ArtifactType = 'server' | 'static-site';

export function sourceRevision(values = process.env) {
  return sourceRevisionSchema.parse(values.SOURCE_REVISION);
}

export async function writeReleaseManifest(
  directory: string,
  artifactType: ArtifactType,
  revision = sourceRevision(),
) {
  await mkdir(directory, { recursive: true });
  await writeFile(
    resolve(directory, 'release.json'),
    `${JSON.stringify({ artifactType, sourceRevision: revision }, null, 2)}\n`,
  );
}
