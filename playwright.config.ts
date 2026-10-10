import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:3000' },
  webServer: [
    {
      command: 'npm run dev:mock-target',
      url: 'http://127.0.0.1:3001/reports/add',
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command:
        'TARGET_BASE_URL=http://127.0.0.1:3001 NEARBY_REPORTS_BASE_URL=http://127.0.0.1:3001 AUTHORITY_LOOKUP_BASE_URL=http://127.0.0.1:3001 SOURCE_REVISION=e2e npm run dev',
      url: 'http://127.0.0.1:3000/health',
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command:
        'PUBLIC_SERVER_BASE_URL=http://127.0.0.1:3000 SOURCE_REVISION=e2e npm run build:static-site && python3 -m http.server 4010 --directory dist/static-site',
      url: 'http://127.0.0.1:4010/index.html',
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
