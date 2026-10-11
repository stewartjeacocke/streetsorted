import { z } from 'zod';

const fullPostcode = /^(?:GIR ?0AA|[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/;

export function normalizePostcode(value: string) {
  return value.trim().replace(/\s+/g, '').toUpperCase();
}

export const postcodeFormSchema = z
  .string()
  .trim()
  .min(1, 'Enter a full postcode.')
  .transform(normalizePostcode)
  .refine((value) => fullPostcode.test(value), 'Enter a full UK postcode.');

export type ResolvedPostcodeLocation = {
  postcode: string;
  latitude: number;
  longitude: number;
};

export type PostcodeLookupOutcome =
  | { state: 'resolved'; location: ResolvedPostcodeLocation }
  | { state: 'not-found' }
  | { state: 'unavailable' };

export type SuggestedPostcodeOutcome =
  { state: 'suggested'; postcode: string } | { state: 'not-found' } | { state: 'unavailable' };

export const suggestionCoordinatesSchema = z.object({
  latitude: z.number().finite().gte(-90).lte(90),
  longitude: z.number().finite().gte(-180).lte(180),
});
