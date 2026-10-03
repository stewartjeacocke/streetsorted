export async function submitReport(payload) {
  const base = window.REPORT_API_ORIGIN || '';
  const response = await fetch(`${base}/api/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const body = await response.json().catch(() => null);
  if (!body) throw new Error('We could not confirm that the report was submitted.');
  return body;
}
