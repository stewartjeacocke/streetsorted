import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ReportDraftSessionStore,
  reportDraftTtlMs,
} from '../../../src/server/services/report-draft-session-store.js';

describe('report draft session store', () => {
  it('expires drafts after five minutes of inactivity', () => {
    const store = new ReportDraftSessionStore();
    const draft = store.create(1000);
    assert.ok(store.get(draft.id, 1000 + reportDraftTtlMs));
    assert.equal(store.get(draft.id, 1000 + reportDraftTtlMs * 2 + 1), null);
  });

  it('clears terminal drafts and keeps retryable drafts until expiry', () => {
    const store = new ReportDraftSessionStore();
    const terminal = store.create();
    store.clear(terminal.id);
    assert.equal(store.get(terminal.id), null);
    const retryable = store.create();
    store.update(retryable, { stage: 'review' });
    assert.equal(store.get(retryable.id)?.stage, 'review');
  });
});
