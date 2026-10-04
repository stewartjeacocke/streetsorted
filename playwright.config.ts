import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:4000' },
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://127.0.0.1:4000',
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: 'npm run dev:mock-target',
      url: 'http://127.0.0.1:3001/reports/add',
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command:
        'TARGET_BASE_URL=http://127.0.0.1:3001 NEARBY_REPORTS_BASE_URL=http://127.0.0.1:3001 npm run dev:server',
      url: 'http://127.0.0.1:3000/health',
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});
