import { randomBytes } from 'node:crypto';
import type { NearbyResult } from '../domain/nearby-report.js';
import type { IncidentLocation } from '../domain/report.js';

export type ReportStage = 'location' | 'nearby' | 'details' | 'review';

export type ReportDraftSession = {
  id: string;
  csrfToken: string;
  stage: ReportStage;
  location?: IncidentLocation;
  description?: string;
  nearby?: NearbyResult;
  lastActivityAt: number;
};

const ttlMs = 5 * 60 * 1000;

function token() {
  return randomBytes(32).toString('base64url');
}

export class ReportDraftSessionStore {
  private readonly sessions = new Map<string, ReportDraftSession>();

  create(now = Date.now()) {
    const draft: ReportDraftSession = {
      id: token(),
      csrfToken: token(),
      stage: 'location',
      lastActivityAt: now,
    };
    this.sessions.set(draft.id, draft);
    return draft;
  }

  get(id: string | undefined, now = Date.now()) {
    if (!id) return null;
    const draft = this.sessions.get(id);
    if (!draft) return null;
    if (now - draft.lastActivityAt > ttlMs) {
      this.sessions.delete(id);
      return null;
    }
    draft.lastActivityAt = now;
    return draft;
  }

  update(
    draft: ReportDraftSession,
    updates: Partial<Omit<ReportDraftSession, 'id' | 'csrfToken'>>,
  ) {
    Object.assign(draft, updates, { lastActivityAt: Date.now() });
    return draft;
  }

  clear(id: string | undefined) {
    if (id) this.sessions.delete(id);
  }

  cleanup(now = Date.now()) {
    for (const [id, draft] of this.sessions)
      if (now - draft.lastActivityAt > ttlMs) this.sessions.delete(id);
  }
}

export const reportDraftTtlMs = ttlMs;
