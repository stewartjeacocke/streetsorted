import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { csrfIsValid, reportSessionId } from '../../../src/server/middleware/report-session.js';
import { ReportDraftSessionStore } from '../../../src/server/services/report-draft-session-store.js';

describe('report session helpers', () => {
  it('reads an opaque session cookie and validates the matching CSRF token', () => {
    const draft = new ReportDraftSessionStore().create();
    const request = { headers: { cookie: `street_sorted_report=${draft.id}` } } as never;
    assert.equal(reportSessionId(request), draft.id);
    assert.equal(csrfIsValid(draft, draft.csrfToken), true);
    assert.equal(csrfIsValid(draft, 'wrong'), false);
    assert.equal(csrfIsValid(draft, undefined), false);
  });
});
