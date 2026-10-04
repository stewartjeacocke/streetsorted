import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatCoordinate } from './location';

describe('formatCoordinate', () => {
  it('rounds to five decimals and omits missing', () => {
    assert.equal(formatCoordinate(51.5381435), '51.53814');
    assert.equal(formatCoordinate(-0.102), '-0.10200');
    assert.equal(formatCoordinate(undefined), null);
  });
});
