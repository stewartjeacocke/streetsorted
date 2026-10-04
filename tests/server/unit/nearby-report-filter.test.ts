import { describe, expect, it } from 'vitest';
import { isRelevantNearbyReport } from '../../../src/server/domain/nearby-report.js';
describe('nearby report relevance', () => {
  it('retains only category 16144 with Completed=false', () => {
    expect(
      isRelevantNearbyReport({ CategoryId: 16144, Completed: false, StatusName: 'Anything' }),
    ).toBe(true);
    expect(isRelevantNearbyReport({ CategoryId: 16144, Completed: true })).toBe(false);
    expect(isRelevantNearbyReport({ CategoryId: 17450, Completed: false })).toBe(false);
  });
  it('fails closed for missing or invalid category/completion values', () => {
    for (const report of [
      {},
      { CategoryId: '16144', Completed: false },
      { CategoryId: 16144, Completed: 'false' },
      { CategoryId: 16144 },
    ])
      expect(isRelevantNearbyReport(report)).toBe(false);
  });
});
