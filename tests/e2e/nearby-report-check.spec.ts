import { expect, test } from "@playwright/test";
async function location(
  page: import("@playwright/test").Page,
  latitude: number,
) {
  await page.addInitScript(
    ({ latitude }) =>
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition(success: PositionCallback) {
            success({
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
      }),
    { latitude },
  );
}
async function start(page: import("@playwright/test").Page, latitude = 51.538) {
  await location(page, latitude);
  await page.goto("/report/");
  await page.getByRole("button", { name: "Use my location" }).click();
}
test.describe("nearby report check", () => {
  test("lists all safe summaries and stops without report submission when a match exists", async ({
    page,
  }) => {
    await start(page);
    await expect(page.getByLabel("Latitude")).toHaveValue("51.538");
    await expect(page.getByLabel("Longitude")).toHaveValue("-0.102");
    await expect(
      page.getByText("Current lookup: 51.53800, -0.10200"),
    ).toBeVisible();
    await expect(page.getByText("Dumped or flytipped waste")).toBeVisible();
    await expect(page.getByText("Pavement obstruction")).toHaveCount(0);
    await expect(page.getByText("Approved waste report")).toBeVisible();
    await expect(page.getByText("Not approved")).toHaveCount(0);
    await expect(page.getByText("Closed Street")).toHaveCount(0);
    await page.getByRole("button", { name: "Yes, a report matches" }).click();
    await expect(page.getByText("No new report was submitted.")).toBeVisible();
    await expect(page.getByLabel("Description")).toBeHidden();
  });
  test("applies edited coordinates to the next nearby lookup and submission flow", async ({
    page,
  }) => {
    let lookupUrl = "";
    page.on("request", (request) => {
      if (request.url().includes("/api/nearby-reports"))
        lookupUrl = request.url();
    });
    await start(page);
    await page.getByLabel("Latitude").fill("51.60000");
    await page.getByLabel("Longitude").fill("-0.20000");
    await page.getByRole("button", { name: "Apply location" }).click();
    await expect(page.getByText("No nearby reports were found.")).toBeVisible();
    await expect.poll(() => lookupUrl).toContain("latitude=51.6");
    await expect(lookupUrl).toContain("longitude=-0.2");
  });
  test("continues without a match after nearby reports are shown", async ({
    page,
  }) => {
    await start(page);
    await page.getByRole("button", { name: "No, none match" }).click();
    await expect(page.getByLabel("Description")).toBeVisible();
  });
  test("continues directly on no results without a match question", async ({
    page,
  }) => {
    await start(page, 51.6);
    await expect(page.getByText("No nearby reports were found.")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "No, none match" }),
    ).toBeHidden();
    await page
      .getByRole("button", { name: "Continue to report details" })
      .click();
    await expect(page.getByLabel("Description")).toBeVisible();
  });
  test("blocks reporting when lookup is unavailable and permits retry", async ({
    page,
  }) => {
    await start(page, 51.7);
    await expect(
      page.getByText(
        "Nearby reports could not be retrieved. Please try again.",
      ),
    ).toBeVisible();
    await expect(page.getByLabel("Description")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Retry nearby reports" }),
    ).toBeVisible();
  });
});

test("retries an unavailable lookup and continues after no-results", async ({
  page,
}) => {
  await start(page, 51.71);
  await expect(
    page.getByRole("button", { name: "Retry nearby reports" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retry nearby reports" }).click();
  await expect(page.getByText("No nearby reports were found.")).toBeVisible();
  await page
    .getByRole("button", { name: "Continue to report details" })
    .click();
  await expect(page.getByLabel("Description")).toBeVisible();
});

test("refreshes stale location and repeats nearby lookup before report details", async ({
  page,
}) => {
  await page.addInitScript(() => {
    let calls = 0;
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition(success: PositionCallback) {
          calls += 1;
          success({
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
            timestamp: calls === 1 ? Date.now() - 301000 : Date.now(),
            toJSON: () => ({}),
          } as GeolocationPosition);
        },
      },
    });
  });
  let lookups = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/nearby-reports")) lookups += 1;
  });
  await page.goto("/report/");
  await page.getByRole("button", { name: "Use my location" }).click();
  await page.getByRole("button", { name: "No, none match" }).click();
  await page.getByLabel("Description").fill("Waste beside bins");
  await page.getByRole("button", { name: "Review report" }).click();
  await expect.poll(() => lookups).toBeGreaterThanOrEqual(2);
});

test("discards nearby summaries when the resident cancels", async ({
  page,
}) => {
  await start(page);
  await expect(page.getByText("Dumped or flytipped waste")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(
    page.getByRole("heading", { name: "Location required" }),
  ).toBeVisible();
  await expect(page.getByText("Dumped or flytipped waste")).toBeHidden();
});

test("uses the existing no-results path when all nearby reports are filtered out", async ({
  page,
}) => {
  await start(page, 51.65);
  await expect(page.getByText("No nearby reports were found.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "No, none match" }),
  ).toBeHidden();
});
