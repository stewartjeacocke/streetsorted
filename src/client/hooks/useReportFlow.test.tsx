import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useReportFlow } from './useReportFlow';
vi.mock('../lib/location', () => ({
  fresh: () => true,
  locate: vi.fn(async () => ({
    latitude: 51.5,
    longitude: -0.1,
    capturedAt: new Date().toISOString(),
  })),
}));
vi.mock('../api/report-api', () => ({
  nearby: vi.fn(async () => ({ state: 'no-results', reports: [] })),
  submit: vi.fn(async () => ({
    state: 'confirmed',
    residentMessage: 'Your report was submitted.',
    reference: 'REF',
    retryAllowed: false,
  })),
}));
describe('useReportFlow', () => {
  it('resets transient draft state', async () => {
    const { result } = renderHook(() => useReportFlow());
    await act(async () => {
      await result.current.getLocation();
    });
    act(() => result.current.continueDetails());
    act(() => result.current.setDescription('Waste'));
    act(() => result.current.reset());
    expect(result.current.step).toBe('location');
    expect(result.current.description).toBe('');
    expect(result.current.location).toBeNull();
  });
  it('moves through no-results, review, and confirmed outcome', async () => {
    const { result } = renderHook(() => useReportFlow());
    await act(async () => {
      await result.current.getLocation();
    });
    act(() => result.current.continueDetails());
    act(() => result.current.setDescription('Waste'));
    await act(async () => {
      await result.current.review();
    });
    expect(result.current.step).toBe('review');
    await act(async () => {
      await result.current.confirm();
    });
    expect(result.current.outcome.message).toBe('Your report was submitted.');
  });
});
