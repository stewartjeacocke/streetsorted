import { expect, test } from '@playwright/test';

test('static landing page preserves ordinary cross-origin navigation', async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4010/');
  await expect(page.getByRole('heading', { name: 'Report fly-tipping' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start a new report' })).toHaveAttribute(
    'href',
    './starting-report.html',
  );
  await page.goto('http://127.0.0.1:4010/starting-report.html', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Starting a new report' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'continue to the report' })).toHaveAttribute(
    'href',
    'http://127.0.0.1:3000/report',
  );
  await page.waitForURL('http://127.0.0.1:3000/report');
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto('http://127.0.0.1:4010/');
  await expect(noJsPage.getByRole('link', { name: 'Start a new report' })).toHaveAttribute(
    'href',
    './starting-report.html',
  );
  await noJsPage.goto('http://127.0.0.1:4010/starting-report.html', {
    waitUntil: 'domcontentloaded',
  });
  await expect(noJsPage.getByRole('heading', { name: 'Starting a new report' })).toBeVisible();
  await noJsPage.waitForURL('http://127.0.0.1:3000/report');
  await noJs.close();
});
