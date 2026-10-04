import { z } from 'zod';

export const councilProfileSchema = z.object({
  id: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  authorityLookupIdentifiers: z.array(z.string().trim().min(1)).min(1),
  active: z.boolean().default(true),
  targetBaseUrl: z.string().url(),
  nearbyReportsBaseUrl: z.string().url(),
  flyTippingCategoryId: z.number().int().nonnegative(),
  outOfAreaMessage: z.string().trim().min(1),
  anonymousSubmissionAvailable: z.boolean(),
  councilSubmissionUrl: z.string().url(),
});
export type CouncilProfile = z.infer<typeof councilProfileSchema>;

export type AuthorityLookupResult =
  | { state: 'assigned'; council: CouncilProfile }
  | { state: 'unsupported' }
  | { state: 'unavailable' };

export function validateCouncilProfiles(profiles: CouncilProfile[]) {
  const identifiers = new Set<string>();
  for (const profile of profiles) {
    if (!profile.active) continue;
    for (const identifier of profile.authorityLookupIdentifiers) {
      if (identifiers.has(identifier))
        throw new Error(`Duplicate active authority identifier: ${identifier}`);
      identifiers.add(identifier);
    }
  }
  return profiles;
}
