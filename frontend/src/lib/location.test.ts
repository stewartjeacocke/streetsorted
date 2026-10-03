import { describe, it, expect } from 'vitest';
import { formatCoordinate } from './location';
describe('formatCoordinate', () => {
  it('rounds to five decimals and omits missing', () => {
    expect(formatCoordinate(51.5381435)).toBe('51.53814');
    expect(formatCoordinate(-0.102)).toBe('-0.10200');
    expect(formatCoordinate(undefined)).toBeNull();
  });
});
