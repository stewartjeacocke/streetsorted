import type { Request, Response } from 'express';
import type { ReportDraftSession } from '../services/report-draft-session-store.js';

export const reportSessionCookieName = 'street_sorted_report';

function cookies(header: string | undefined) {
  return Object.fromEntries(
    (header ?? '')
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([key, value]) => Boolean(key && value))
      .map(([key, ...value]) => [key, decodeURIComponent(value.join('='))]),
  );
}

export function reportSessionId(req: Request) {
  return cookies(req.headers.cookie)[reportSessionCookieName];
}

export function setReportSession(res: Response, draft: ReportDraftSession) {
  res.cookie(reportSessionCookieName, draft.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/report',
    maxAge: 5 * 60 * 1000,
  });
}

export function clearReportSession(res: Response) {
  res.clearCookie(reportSessionCookieName, { path: '/report' });
}

export function csrfIsValid(draft: ReportDraftSession, value: unknown) {
  return typeof value === 'string' && value.length > 0 && value === draft.csrfToken;
}
