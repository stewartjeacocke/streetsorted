# Quickstart: Validate Nearby Location Display

1. Run the existing React frontend, backend, and mock target under Node.js 26.
2. Grant location permission and reach the nearby-reports step.
3. Verify latitude and longitude appear with five decimal places.
4. Verify the nearby lookup still receives the full browser-provided values.
5. Retry with refreshed location and verify displayed values update.
6. Cancel or deny location and verify no prior coordinate values remain visible.

Run React unit tests, the frontend production build, and the Playwright nearby-report suite.

- **2026-10-03**: Editable-coordinate React unit/build/lint/format and browser regression validation passed.
