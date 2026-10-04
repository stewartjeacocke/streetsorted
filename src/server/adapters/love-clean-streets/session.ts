import * as cheerio from 'cheerio';
import type { AxiosInstance } from 'axios';

export interface TargetForm {
  action: string;
  fields: Record<string, string>;
  token: string;
}

export async function startAnonymousSession(client: AxiosInstance) {
  const bootstrap = await client.post('/home/ssosignin');
  if (bootstrap.status < 300 || bootstrap.status >= 400 || !bootstrap.headers.location)
    throw new Error('Target anonymous session could not be started');
  const page = await client.get(String(bootstrap.headers.location));
  if (page.status !== 200 || typeof page.data !== 'string')
    throw new Error('Target report form could not be loaded');
  return parseTargetForm(page.data);
}

export function parseTargetForm(html: string): TargetForm {
  const $ = cheerio.load(html);
  const form = $('form#addReportForm');
  const action = form.attr('action');
  const token = form.find('input[name="__RequestVerificationToken"]').val();
  if (!action || typeof token !== 'string' || !token)
    throw new Error('Target report form is incompatible');
  const fields: Record<string, string> = {};
  form.find('input[type="hidden"][name]:not([disabled])').each((_, element) => {
    const node = $(element);
    fields[node.attr('name')!] = node.val()?.toString() ?? '';
  });
  return { action, fields, token };
}
