import type { CouncilProfile } from '../../../src/server/domain/council.js';

export function mockCouncilProfiles(baseUrl: string): CouncilProfile[] {
  return [
    {
      id: 'islington',
      displayName: 'Islington Council',
      authorityLookupIdentifiers: ['islington'],
      active: true,
      targetBaseUrl: baseUrl,
      nearbyReportsBaseUrl: baseUrl,
      flyTippingCategoryId: 16144,
      outOfAreaMessage: 'This location is outside Islington and was not submitted.',
    },
    {
      id: 'camden',
      displayName: 'Camden Council',
      authorityLookupIdentifiers: ['camden'],
      active: true,
      targetBaseUrl: baseUrl,
      nearbyReportsBaseUrl: baseUrl,
      flyTippingCategoryId: 16144,
      outOfAreaMessage: 'This location is outside Camden and was not submitted.',
    },
  ];
}
