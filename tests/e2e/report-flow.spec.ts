import { expect, test } from "@playwright/test";

async function mockLocation(
  page: import("@playwright/test").Page,
  mode: "granted" | "denied",
  latitude = 51.538,
) {
  await page.addInitScript(
    ({ mode, latitude }) => {
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
                latitude,
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
    { mode, latitude },
  );
}
async function reachDetails(
  page: import("@playwright/test").Page,
  description = "Waste beside bins",
) {
  await mockLocation(page, "granted");
  await page.goto("/report/");
  await page.getByRole("button", { name: "Use my location" }).click();
  await page.getByRole("button", { name: "No, none match" }).click();
  await expect(page.getByLabel("Description")).toBeVisible();
  await page.getByLabel("Description").fill(description);
}
async function reachReview(
  page: import("@playwright/test").Page,
  description = "Waste beside bins",
) {
  await reachDetails(page, description);
  await page.getByRole("button", { name: "Review report" }).click();
  await expect(
    page.getByRole("heading", { name: "Review report" }),
  ).toBeVisible();
}
test.describe("fly-tipping report flow", () => {
  test("submits after no nearby report matches", async ({ page }) => {
    await reachReview(page);
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
  });
  test("cancels an in-memory draft without sending a report", async ({
    page,
  }) => {
    await reachDetails(page);
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(
      page.getByRole("heading", { name: "Location required" }),
    ).toBeVisible();
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
  });
});
