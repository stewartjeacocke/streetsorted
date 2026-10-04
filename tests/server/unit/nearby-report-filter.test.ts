import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isRelevantNearbyReport } from '../../../src/server/domain/nearby-report.js';
describe('nearby report relevance', () => {
  it('retains only category 16144 with Completed=false', () => {
    assert.equal(
      isRelevantNearbyReport({ CategoryId: 16144, Completed: false, StatusName: 'Anything' }),
      true,
    );
    assert.equal(isRelevantNearbyReport({ CategoryId: 16144, Completed: true }), false);
    assert.equal(isRelevantNearbyReport({ CategoryId: 17450, Completed: false }), false);
  });
  it('fails closed for missing or invalid category/completion values', () => {
    for (const report of [
      {},
      { CategoryId: '16144', Completed: false },
      { CategoryId: 16144, Completed: 'false' },
      { CategoryId: 16144 },
    ])
      assert.equal(isRelevantNearbyReport(report), false);
  });
});
