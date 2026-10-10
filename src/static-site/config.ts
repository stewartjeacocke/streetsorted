import { z } from 'zod';
import { sourceRevision } from '../server/release-manifest.js';

const baseUrlSchema = z
  .string()
  .trim()
  .url()
  .transform((value, ctx) => {
    const url = new URL(value);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/'
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'PUBLIC_SERVER_BASE_URL must be an origin without credentials, path, query, or fragment',
      });
      return z.NEVER;
    }
    return url.origin;
  });

export function staticSiteConfig(values = process.env) {
  return {
    publicServerBaseUrl: baseUrlSchema.parse(values.PUBLIC_SERVER_BASE_URL),
    sourceRevision: sourceRevision(values),
  };
}
