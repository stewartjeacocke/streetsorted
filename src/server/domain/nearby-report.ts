import { z } from 'zod';
import { flyTippingCategoryId } from './report.js';

export const nearbyQuerySchema = z.object({
  latitude: z.coerce.number().gte(-90).lte(90),
  longitude: z.coerce.number().gte(-180).lte(180),
});
export type NearbyQuery = z.infer<typeof nearbyQuerySchema>;
export interface RawNearbyReport {
  Id?: unknown;
  CategoryId?: unknown;
  Completed?: unknown;
  CategoryName?: unknown;
  DateTimeRecorded?: unknown;
  Address?: unknown;
  StatusName?: unknown;
  Description?: unknown;
  Approved?: unknown;
}
export function isRelevantNearbyReport(report: RawNearbyReport) {
  return report.CategoryId === flyTippingCategoryId &&
    report.Completed === false && report.StatusName !== 'Reject'
    && report.StatusName !== 'Unjustified';
}
export const nearbySummarySchema = z.object({
  id: z.string(),
  categoryName: z.string().nullable(),
  recordedAt: z.string().nullable(),
  locationLabel: z.string().nullable(),
  statusName: z.string().nullable(),
  description: z.string().nullable(),
});
export type NearbyReportSummary = z.infer<typeof nearbySummarySchema>;
export type NearbyResult =
  | { state: 'reports-found'; reports: NearbyReportSummary[] }
  | { state: 'no-results'; reports: [] }
  | { state: 'unavailable'; residentMessage: string };
