import { z } from 'zod';

export const publicCouncilProfileSchema = z.object({
  id: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  anonymousSubmissionAvailable: z.boolean(),
  councilSubmissionUrl: z.string().url(),
});
export type PublicCouncilProfile = z.infer<typeof publicCouncilProfileSchema>;

export const defaultPublicCouncilProfiles: PublicCouncilProfile[] = [
  {
    id: 'islington',
    displayName: 'Islington Council',
    anonymousSubmissionAvailable: true,
    councilSubmissionUrl: 'https://www.islington.gov.uk/cleaning-and-recycling/report-a-problem',
  },
  {
    id: 'camden',
    displayName: 'Camden Council',
    anonymousSubmissionAvailable: false,
    councilSubmissionUrl: 'https://www.camden.gov.uk/fly-tipping-street-obstructions',
  },
  {
    id: 'ealing',
    displayName: 'Ealing Council',
    anonymousSubmissionAvailable: false,
    councilSubmissionUrl: 'https://www.ealing.gov.uk/reportit',
  },
  {
    id: 'wolverhampton',
    displayName: 'City of Wolverhampton Council',
    anonymousSubmissionAvailable: false,
    councilSubmissionUrl: 'https://www.wolverhampton.gov.uk/environment-and-climate/fly-tipping',
  },
  {
    id: 'eastbourne',
    displayName: 'Eastbourne Borough Council',
    anonymousSubmissionAvailable: false,
    councilSubmissionUrl: 'https://www.lewes-eastbourne.gov.uk/environment-and-climate',
  },
  {
    id: 'basingstoke',
    displayName: 'Basingstoke and Deane Borough Council',
    anonymousSubmissionAvailable: false,
    councilSubmissionUrl: 'https://www.basingstoke.gov.uk/fly-tipping',
  },
  {
    id: 'bury',
    displayName: 'Bury Council',
    anonymousSubmissionAvailable: false,
    councilSubmissionUrl:
      'https://www.bury.gov.uk/roads-travel-and-parking/street-care-and-cleaning/fly-tipping',
  },
  {
    id: 'havering',
    displayName: 'Havering Council',
    anonymousSubmissionAvailable: false,
    councilSubmissionUrl: 'https://www.havering.gov.uk/fly-tipping',
  },
  {
    id: 'hammersmith-fulham',
    displayName: 'Hammersmith & Fulham Council',
    anonymousSubmissionAvailable: false,
    councilSubmissionUrl:
      'https://www.lbhf.gov.uk/environment/pollution-and-air-quality/fly-tipping',
  },
  {
    id: 'lancaster',
    displayName: 'Lancaster City Council',
    anonymousSubmissionAvailable: true,
    councilSubmissionUrl: 'https://www.lancaster.gov.uk/environmental-health/fly-tipping',
  },
  {
    id: 'redbridge',
    displayName: 'Redbridge Council',
    anonymousSubmissionAvailable: false,
    councilSubmissionUrl:
      'https://www.redbridge.gov.uk/rubbish-recycling-and-environment/fly-tipping/',
  },
];
