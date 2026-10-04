export function escapeHtml(value: unknown) {
  return String(value ?? '').replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!,
  );
}

export function page(title: string, body: string, options: { locationHelper?: boolean } = {}) {
  const helper = options.locationHelper ? '<script defer src="/location-helper.js"></script>' : '';
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} | Street Sorted</title><link rel="stylesheet" href="/report.css">${helper}</head><body><main class="page"><h1>Street Sorted</h1>${body}</main></body></html>`;
}

export function errors(messages: string[]) {
  return messages.length
    ? `<div class="error" role="alert"><ul>${messages.map((message) => `<li>${escapeHtml(message)}</li>`).join('')}</ul></div>`
    : '';
}

export function hiddenCsrf(token: string) {
  return `<input type="hidden" name="csrf" value="${escapeHtml(token)}">`;
}

export function recovery(message: string) {
  return page(
    'Start a report',
    `<section><h2>Start a report</h2><p role="alert">${escapeHtml(message)}</p><p><a href="/report">Start a new report</a></p></section>`,
  );
}
