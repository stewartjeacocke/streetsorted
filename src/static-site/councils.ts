import { z } from 'zod';
import {
  defaultPublicCouncilProfiles,
  publicCouncilProfileSchema,
  type PublicCouncilProfile,
} from '../server/domain/public-councils.js';

export { publicCouncilProfileSchema, type PublicCouncilProfile };

const defaults: PublicCouncilProfile[] = defaultPublicCouncilProfiles;

export function publicCouncilProfiles(values = process.env): PublicCouncilProfile[] {
  if (!values.COUNCIL_PROFILES) return defaults;
  const profiles = z.array(publicCouncilProfileSchema).parse(JSON.parse(values.COUNCIL_PROFILES));
  if (new Set(profiles.map((profile) => profile.id)).size !== profiles.length)
    throw new Error('COUNCIL_PROFILES contains duplicate public council IDs');
  return profiles;
}
