import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useReportFlow, type ReportFlowDependencies } from './useReportFlow';

const dependencies: ReportFlowDependencies = {
  fresh: () => true,
  locate: async () => ({
    latitude: 51.5,
    longitude: -0.1,
    capturedAt: new Date().toISOString(),
  }),
  nearby: async () => ({ state: 'no-results', reports: [] }),
  submit: async () => ({
    state: 'confirmed',
    residentMessage: 'Your report was submitted.',
    reference: 'REF',
    retryAllowed: false,
  }),
};

afterEach(cleanup);

describe('useReportFlow', () => {
  it('resets transient draft state', async () => {
    const { result } = renderHook(() => useReportFlow(dependencies));
    await act(async () => {
      await result.current.getLocation();
    });
    act(() => result.current.continueDetails());
    act(() => result.current.setDescription('Waste'));
    act(() => result.current.reset());
    assert.equal(result.current.step, 'location');
    assert.equal(result.current.description, '');
    assert.equal(result.current.location, null);
  });

  it('moves through no-results, review, and confirmed outcome', async () => {
    const { result } = renderHook(() => useReportFlow(dependencies));
    await act(async () => {
      await result.current.getLocation();
    });
    act(() => result.current.continueDetails());
    act(() => result.current.setDescription('Waste'));
    await act(async () => {
      await result.current.review();
    });
    assert.equal(result.current.step, 'review');
    await act(async () => {
      await result.current.confirm();
    });
    assert.equal(result.current.outcome.message, 'Your report was submitted.');
  });
});
