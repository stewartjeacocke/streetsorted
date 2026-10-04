import { expect, test } from '@playwright/test';

async function reachDetails(page: import('@playwright/test').Page, latitude = '51.65') {
  await page.goto('/report');
  await page.getByLabel('Latitude').fill(latitude);
  await page.getByLabel('Longitude').fill('-0.102');
  await page.getByRole('button', { name: 'Check nearby reports' }).click();
  await page.getByRole('button', { name: 'Continue to report details' }).click();
}

test.describe('progressively enhanced reporting', () => {
  test.use({ javaScriptEnabled: false });

  test('submits a manual report with JavaScript disabled', async ({ page }) => {
    await reachDetails(page);
    await page.getByLabel('Description').fill('Waste beside bins');
    await page.getByRole('button', { name: 'Review report' }).click();
    await expect(page.getByRole('heading', { name: 'Review report' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm submission' }).click();
    await expect(page.getByText('Your report was submitted.')).toBeVisible();
    await expect(page.getByText('Reference: MOCK-100')).toBeVisible();
  });

  test('allows duplicate-match exit without submitting a report', async ({ page }) => {
    await page.goto('/report');
    await page.getByLabel('Latitude').fill('51.538');
    await page.getByLabel('Longitude').fill('-0.102');
    await page.getByRole('button', { name: 'Check nearby reports' }).click();
    await expect(page.getByText('Dumped or flytipped waste')).toBeVisible();
    await page.getByRole('button', { name: 'Yes, a report matches' }).click();
    await expect(page.getByText('No new report was submitted.')).toBeVisible();
  });

  test('shows server-side validation and recovery pages', async ({ page }) => {
    await page.goto('/report');
    await page.getByLabel('Latitude').fill('bad');
    await page.getByLabel('Longitude').fill('-0.102');
    await page.getByRole('button', { name: 'Check nearby reports' }).click();
    await expect(page.getByText('Enter a valid latitude.')).toBeVisible();
    await page.goto('/report/review');
    await expect(page.getByText('Start a new report')).toBeVisible();
  });
});

test('uses the optional helper only to fill the manual location form', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition(success: PositionCallback) {
          success({ coords: { latitude: 51.65, longitude: -0.102 } } as GeolocationPosition);
        },
      },
    });
  });
  await page.goto('/report');
  await expect(page.getByLabel('Latitude')).toHaveValue('51.65');
  await expect(page.getByLabel('Longitude')).toHaveValue('-0.102');
  await page.getByRole('button', { name: 'Check nearby reports' }).click();
  await expect(page.getByRole('button', { name: 'Continue to report details' })).toBeVisible();
});

test('retries an unconfirmed submission with ordinary form data', async ({ page }) => {
  await page.goto('/report');
  await page.getByLabel('Latitude').fill('51.65');
  await page.getByLabel('Longitude').fill('-0.102');
  await page.getByRole('button', { name: 'Check nearby reports' }).click();
  await page.getByRole('button', { name: 'Continue to report details' }).click();
  await page.getByLabel('Description').fill('ambiguous');
  await page.getByRole('button', { name: 'Review report' }).click();
  await page.getByRole('button', { name: 'Confirm submission' }).click();
  await expect(page.getByText('We could not confirm that the report was submitted.')).toBeVisible();
  await page.getByRole('button', { name: 'Try submission again' }).click();
  await expect(page.getByText('We could not confirm that the report was submitted.')).toBeVisible();
  await expect(
    page.getByText('Review a current location and explicitly confirm before submitting.'),
  ).toHaveCount(0);
});

test.describe('nearby availability and ordinary navigation', () => {
  test.use({ javaScriptEnabled: false });

  test('allows a nearby-lookup retry and has no client route shell', async ({ page }) => {
    await page.goto('/report');
    await page.getByLabel('Latitude').fill('51.7');
    await page.getByLabel('Longitude').fill('-0.102');
    await page.getByRole('button', { name: 'Check nearby reports' }).click();
    await expect(
      page.getByText('Nearby reports could not be retrieved. Please try again.'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Retry nearby reports' }).click();
    await expect(page.getByRole('button', { name: 'Continue to report details' })).toBeVisible();
    await expect(page.locator('#root')).toHaveCount(0);
  });
});
