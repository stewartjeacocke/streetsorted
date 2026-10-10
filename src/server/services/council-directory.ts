import type { AppConfig } from '../config.js';
import { defaultPublicCouncilProfiles } from '../domain/public-councils.js';
import {
  councilProfileSchema,
  type CouncilProfile,
  validateCouncilProfiles,
} from '../domain/council.js';

export class CouncilDirectory {
  readonly profiles: CouncilProfile[];
  constructor(profiles: CouncilProfile[]) {
    this.profiles = validateCouncilProfiles(profiles);
  }
  match(authorityIds: string[]) {
    const matches = this.profiles.filter(
      (profile) =>
        profile.active &&
        profile.authorityLookupIdentifiers.some((id) => authorityIds.includes(id)),
    );
    return matches.length === 1 ? matches[0] : null;
  }
  get(id: string | undefined) {
    return this.profiles.find((profile) => profile.id === id && profile.active) ?? null;
  }
}

export type PublicCouncilProfile = Pick<
  CouncilProfile,
  'id' | 'displayName' | 'anonymousSubmissionAvailable' | 'councilSubmissionUrl'
>;

export function publicCouncilProfilesFromConfig(config: AppConfig): PublicCouncilProfile[] {
  return councilDirectoryFromConfig(config).profiles.map(
    ({ id, displayName, anonymousSubmissionAvailable, councilSubmissionUrl }) => ({
      id,
      displayName,
      anonymousSubmissionAvailable,
      councilSubmissionUrl,
    }),
  );
}

export function councilDirectoryFromConfig(config: AppConfig) {
  const fallback = [
    {
      id: 'islington',
      displayName: 'Islington Council',
      authorityLookupIdentifiers: ['2507', 'islington'],
      active: true,
      targetBaseUrl: config.TARGET_BASE_URL,
      nearbyReportsBaseUrl: config.NEARBY_REPORTS_BASE_URL,
      flyTippingCategoryId: 16144,
      outOfAreaMessage: 'This location is outside Islington and was not submitted.',
      anonymousSubmissionAvailable: true,
      councilSubmissionUrl: 'https://www.islington.gov.uk/cleaning-and-recycling/report-a-problem',
    },
    {
      id: 'camden',
      displayName: 'Camden Council',
      authorityLookupIdentifiers: ['2505'],
      active: true,
      targetBaseUrl: 'https://camden.lovecleanstreets.com',
      nearbyReportsBaseUrl: 'https://api.mediaklik.com',
      flyTippingCategoryId: 14846,
      outOfAreaMessage: 'This location is outside Camden and was not submitted.',
      anonymousSubmissionAvailable: false,
      councilSubmissionUrl: 'https://www.camden.gov.uk/fly-tipping-street-obstructions',
    },
    {
      id: 'ealing',
      displayName: 'Ealing Council',
      authorityLookupIdentifiers: ['2484'],
      active: true,
      targetBaseUrl: 'https://ealing.lovecleanstreets.com',
      nearbyReportsBaseUrl: 'https://api.mediaklik.com',
      flyTippingCategoryId: 15669,
      outOfAreaMessage: 'This location is outside Ealing and was not submitted.',
      anonymousSubmissionAvailable: false,
      councilSubmissionUrl: 'https://www.ealing.gov.uk/reportit',
    },
    {
      id: 'wolverhampton',
      displayName: 'City of Wolverhampton Council',
      authorityLookupIdentifiers: ['2519'],
      active: true,
      targetBaseUrl: 'https://wolverhampton.lovecleanstreets.com',
      nearbyReportsBaseUrl: 'https://api.mediaklik.com',
      flyTippingCategoryId: 15765,
      outOfAreaMessage: 'This location is outside Wolverhampton and was not submitted.',
      anonymousSubmissionAvailable: false,
      councilSubmissionUrl: 'https://www.wolverhampton.gov.uk/environment-and-climate/fly-tipping',
    },
    {
      id: 'eastbourne',
      displayName: 'Eastbourne Borough Council',
      authorityLookupIdentifiers: ['2307'],
      active: true,
      targetBaseUrl: 'https://eastbourne.lovecleanstreets.com',
      nearbyReportsBaseUrl: 'https://api.mediaklik.com',
      flyTippingCategoryId: 11335,
      outOfAreaMessage: 'This location is outside Eastbourne and was not submitted.',
      anonymousSubmissionAvailable: false,
      councilSubmissionUrl: 'https://www.lewes-eastbourne.gov.uk/environment-and-climate',
    },
    {
      id: 'basingstoke',
      displayName: 'Basingstoke and Deane Borough Council',
      authorityLookupIdentifiers: ['2327'],
      active: true,
      targetBaseUrl: 'https://basingstoke.lovecleanstreets.com',
      nearbyReportsBaseUrl: 'https://api.mediaklik.com',
      flyTippingCategoryId: 0,
      outOfAreaMessage: 'This location is outside Basingstoke and Deane and was not submitted.',
      anonymousSubmissionAvailable: false,
      councilSubmissionUrl: 'https://www.basingstoke.gov.uk/fly-tipping',
    },
    {
      id: 'bury',
      displayName: 'Bury Council',
      authorityLookupIdentifiers: ['2517'],
      active: true,
      targetBaseUrl: 'https://bury.lovecleanstreets.com',
      nearbyReportsBaseUrl: 'https://api.mediaklik.com',
      flyTippingCategoryId: 0,
      outOfAreaMessage: 'This location is outside Bury and was not submitted.',
      anonymousSubmissionAvailable: false,
      councilSubmissionUrl:
        'https://www.bury.gov.uk/roads-travel-and-parking/street-care-and-cleaning/fly-tipping',
    },
    {
      id: 'havering',
      displayName: 'Havering Council',
      authorityLookupIdentifiers: ['2485'],
      active: true,
      targetBaseUrl: 'https://haveringcc.lovecleanstreets.com',
      nearbyReportsBaseUrl: 'https://api.mediaklik.com',
      flyTippingCategoryId: 0,
      outOfAreaMessage: 'This location is outside Havering and was not submitted.',
      anonymousSubmissionAvailable: false,
      councilSubmissionUrl: 'https://www.havering.gov.uk/fly-tipping',
    },
    {
      id: 'hammersmith-fulham',
      displayName: 'Hammersmith & Fulham Council',
      authorityLookupIdentifiers: ['2502'],
      active: true,
      targetBaseUrl: 'https://hfh.lovecleanstreets.com',
      nearbyReportsBaseUrl: 'https://api.mediaklik.com',
      flyTippingCategoryId: 11338,
      outOfAreaMessage: 'This location is outside Hammersmith & Fulham and was not submitted.',
      anonymousSubmissionAvailable: false,
      councilSubmissionUrl:
        'https://www.lbhf.gov.uk/environment/pollution-and-air-quality/fly-tipping',
    },
    {
      id: 'lancaster',
      displayName: 'Lancaster City Council',
      authorityLookupIdentifiers: ['2361'],
      active: true,
      targetBaseUrl: 'https://lancaster.lovecleanstreets.com',
      nearbyReportsBaseUrl: 'https://api.mediaklik.com',
      flyTippingCategoryId: 17044,
      outOfAreaMessage: 'This location is outside Lancaster and was not submitted.',
      anonymousSubmissionAvailable: true,
      councilSubmissionUrl: 'https://www.lancaster.gov.uk/environmental-health/fly-tipping',
    },
    {
      id: 'redbridge',
      displayName: 'Redbridge Council',
      authorityLookupIdentifiers: ['2497'],
      active: true,
      targetBaseUrl: 'https://redbridge.lovecleanstreets.com',
      nearbyReportsBaseUrl: 'https://api.mediaklik.com',
      flyTippingCategoryId: 0,
      outOfAreaMessage: 'This location is outside Redbridge and was not submitted.',
      anonymousSubmissionAvailable: false,
      councilSubmissionUrl:
        'https://www.redbridge.gov.uk/rubbish-recycling-and-environment/fly-tipping/',
    },
  ];
  const publicProfiles = new Map(
    defaultPublicCouncilProfiles.map((profile) => [profile.id, profile]),
  );
  const sharedFallback = fallback.map((profile) => ({
    ...profile,
    ...publicProfiles.get(profile.id),
  }));
  const raw = config.COUNCIL_PROFILES ? JSON.parse(config.COUNCIL_PROFILES) : sharedFallback;
  return new CouncilDirectory(zProfiles(raw));
}
function zProfiles(raw: unknown): CouncilProfile[] {
  if (!Array.isArray(raw)) throw new Error('COUNCIL_PROFILES must be a JSON array');
  return raw.map((profile) => councilProfileSchema.parse(profile));
}
