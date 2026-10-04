import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CouncilRoutingService } from '../../../src/server/services/council-routing-service.js';
import { CouncilDirectory } from '../../../src/server/services/council-directory.js';
import { mockCouncilProfiles } from '../support/mock-councils.js';

describe('council routing service', () => {
  const directory = new CouncilDirectory(mockCouncilProfiles('http://example.test'));
  it('assigns only an active matched profile', async () => {
    const service = new CouncilRoutingService({ lookup: async () => ['camden'] }, directory);
    const result = await service.route({ latitude: 51.51, longitude: -0.1 });
    assert.equal(result.state, 'assigned');
    if (result.state === 'assigned') assert.equal(result.council.id, 'camden');
  });
  it('fails closed for unsupported and unavailable results', async () => {
    const unsupported = await new CouncilRoutingService(
      { lookup: async () => ['unknown'] },
      directory,
    ).route({ latitude: 1, longitude: 1 });
    const unavailable = await new CouncilRoutingService(
      { lookup: async () => null },
      directory,
    ).route({ latitude: 1, longitude: 1 });
    assert.equal(unsupported.state, 'unsupported');
    assert.equal(unavailable.state, 'unavailable');
  });
});
