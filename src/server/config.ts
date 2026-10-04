import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGIN: z.string().url().default('http://127.0.0.1:3000'),
  TARGET_BASE_URL: z.string().url().default('https://islington.lovecleanstreets.com'),
  NEARBY_REPORTS_BASE_URL: z.string().url().default('https://api.mediaklik.com'),
  NEARBY_REPORTS_DAYS: z.coerce.number().int().positive().default(30),
  AUTHORITY_LOOKUP_BASE_URL: z.string().url().default('https://mapit.mysociety.org'),
  AUTHORITY_LOOKUP_API_KEY: z.string().trim().optional(),
  COUNCIL_PROFILES: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
});
export type AppConfig = z.infer<typeof schema>;
export function loadConfig(values = process.env): AppConfig {
  return schema.parse(values);
}
