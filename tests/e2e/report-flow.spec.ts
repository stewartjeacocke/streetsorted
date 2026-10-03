import { expect, test } from "@playwright/test";

async function mockLocation(
  page: import("@playwright/test").Page,
  mode: "granted" | "denied",
) {
  await page.addInitScript(
    ({ mode }) => {
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition(
            success: PositionCallback,
            error: PositionErrorCallback,
          ) {
            if (mode === "denied")
              return error({
                code: 1,
                message: "Denied",
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3,
              } as GeolocationPositionError);
            return success({
              coords: {
                latitude: 51.538,
                longitude: -0.102,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
                toJSON: () => ({}),
              },
              timestamp: Date.now(),
              toJSON: () => ({}),
            } as GeolocationPosition);
          },
        },
      });
    },
    { mode },
  );
}

async function reachReview(
  page: import("@playwright/test").Page,
  description = "Waste beside bins",
) {
  await mockLocation(page, "granted");
  await page.goto("/report/");
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByLabel("Description")).toBeVisible();
  await page.getByLabel("Description").fill(description);
  await page.getByRole("button", { name: "Review report" }).click();
  await expect(
    page.getByRole("heading", { name: "Review report" }),
  ).toBeVisible();
}

test.describe("fly-tipping report flow", () => {
  test("submits the fixed-category anonymous report and displays the confirmation reference", async ({
    page,
  }) => {
    await reachReview(page);
    await expect(page.locator("select")).toHaveCount(0);
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
    await expect(
      page.locator("#review-step").getByText("Fly-tipping", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Confirm and submit report" })
      .click();
    await expect(page.getByText("Your report was submitted.")).toBeVisible();
    await expect(page.getByText("Reference: MOCK-100")).toBeVisible();
  });

  test("explains denied location access and allows a retry", async ({
    page,
  }) => {
    await mockLocation(page, "denied");
    await page.goto("/report/");
    await page.getByRole("button", { name: "Use my location" }).click();
    await expect(
      page.getByText(
        "Location access is required. Please retry location detection.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Retry location" }),
    ).toBeVisible();
  });

  test("cancels an in-memory draft without sending a report", async ({
    page,
  }) => {
    await mockLocation(page, "granted");
    await page.goto("/report/");
    await page.getByRole("button", { name: "Use my location" }).click();
    await page.getByLabel("Description").fill("Waste beside bins");
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(
      page.getByRole("heading", { name: "Location required" }),
    ).toBeVisible();
    await expect(page.getByLabel("Description")).toBeHidden();
  });

  test("shows an unconfirmed outcome when the target result is ambiguous", async ({
    page,
  }) => {
    await reachReview(page, "ambiguous");
    await page
      .getByRole("button", { name: "Confirm and submit report" })
      .click();
    await expect(
      page.getByText("We could not confirm that the report was submitted."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Try submission again" }),
    ).toBeVisible();
  });

  test("shows a non-retryable out-of-area outcome", async ({ page }) => {
    await reachReview(page, "outside");
    await page
      .getByRole("button", { name: "Confirm and submit report" })
      .click();
    await expect(
      page.getByText(
        "This location is outside Islington and cannot be submitted through this service.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Try submission again" }),
    ).toBeHidden();
  });
});
