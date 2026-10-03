import { z } from 'zod';

export const flyTippingCategoryId = 16144;
export const maxLocationAgeMs = 5 * 60 * 1000;

export interface IncidentLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  capturedAt: string;
}

export function isFreshLocation(location: IncidentLocation, now = Date.now()) {
  const capturedAt = Date.parse(location.capturedAt);
  return Number.isFinite(capturedAt) && capturedAt <= now && now - capturedAt <= maxLocationAgeMs;
}

const locationSchema = z
  .object({
    latitude: z.number().gte(-90).lte(90),
    longitude: z.number().gte(-180).lte(180),
    accuracyMeters: z.number().nonnegative().optional(),
    capturedAt: z.string().datetime(),
  })
  .refine(isFreshLocation, 'Location must be refreshed before submission.');

export const reportRequestSchema = z.object({
  category: z.literal('fly-tipping'),
  location: locationSchema,
  description: z.string().trim().min(1, 'Enter a description.').max(1000),
  confirmed: z.literal(true),
});
export type ReportDraft = z.infer<typeof reportRequestSchema>;
export const outcomeSchema = z.object({
  state: z.enum(['confirmed', 'unconfirmed', 'failed']),
  reference: z.string().nullable(),
  residentMessage: z.string(),
  retryAllowed: z.boolean(),
});
export type SubmissionOutcome = z.infer<typeof outcomeSchema>;
