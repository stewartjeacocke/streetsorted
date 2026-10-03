import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:4000" },
  webServer: [
    {
      command:
        'cd frontend && PATH="$HOME/.local/share/gem/ruby/3.3.0/bin:$PATH" bundle exec jekyll serve --host 127.0.0.1 --port 4000',
      url: "http://127.0.0.1:4000",
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: "npm --prefix backend run dev:mock-target",
      url: "http://127.0.0.1:3001/reports/add",
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command:
        "FRONTEND_ORIGIN=http://127.0.0.1:4000 TARGET_BASE_URL=http://127.0.0.1:3001 NEARBY_REPORTS_BASE_URL=http://127.0.0.1:3001 npm --prefix backend run dev",
      url: "http://127.0.0.1:3000/health",
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
