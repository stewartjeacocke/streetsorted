import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CouncilDirectory } from '../../../src/server/services/council-directory.js';
import { mockCouncilProfiles } from '../support/mock-councils.js';

describe('council directory', () => {
  it('matches one active profile and excludes disabled profiles', () => {
    const profiles = mockCouncilProfiles('http://example.test');
    profiles[1] = { ...profiles[1], active: false };
    const directory = new CouncilDirectory(profiles);
    assert.equal(directory.match(['islington'])?.id, 'islington');
    assert.equal(directory.match(['camden']), null);
  });
  it('rejects duplicate active authority identifiers', () => {
    const profiles = mockCouncilProfiles('http://example.test');
    profiles[1] = { ...profiles[1], authorityLookupIdentifiers: ['islington'] };
    assert.throws(() => new CouncilDirectory(profiles), /Duplicate active authority identifier/);
  });
});
