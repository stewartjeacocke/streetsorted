import * as cheerio from 'cheerio';
import type { SubmissionOutcome } from '../../domain/report.js';

export function parseOutcome(status: number, html: string): SubmissionOutcome {
  const $ = cheerio.load(html);
  const reference =
    $('[data-report-reference], #report-reference').first().attr('data-report-reference') ||
    $('[data-report-reference], #report-reference').first().text().trim() ||
    null;
  const text = $.text().replace(/\s+/g, ' ').trim();
  if (/not within (the )?(boundary|area)|outside.*(boundary|area)|another authority/i.test(text)) {
    return {
      state: 'failed',
      reference: null,
      residentMessage:
        'This location is outside Islington and cannot be submitted through this service.',
      retryAllowed: false,
    };
  }
  const success =
    status >= 200 &&
    status < 300 &&
    (Boolean(reference) || /report (has been )?(submitted|received)|thank you/i.test(text));
  if (success)
    return {
      state: 'confirmed',
      reference,
      residentMessage: 'Your report was submitted.',
      retryAllowed: false,
    };
  if (status >= 400 || /validation|required|invalid/i.test(text))
    return {
      state: 'failed',
      reference: null,
      residentMessage: 'The report could not be accepted. Check the details and try again.',
      retryAllowed: true,
    };
  return {
    state: 'unconfirmed',
    reference: null,
    residentMessage: 'We could not confirm that the report was submitted.',
    retryAllowed: true,
  };
}
