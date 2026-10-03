import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:4000'),
  TARGET_BASE_URL: z.string().url().default('https://islington.lovecleanstreets.com'),
  NEARBY_REPORTS_BASE_URL: z.string().url().default('https://api.mediaklik.com'),
  NEARBY_REPORTS_DAYS: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
});
export type AppConfig = z.infer<typeof schema>;
export function loadConfig(values = process.env): AppConfig {
  return schema.parse(values);
}
