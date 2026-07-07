import { defineConfig, devices } from '@playwright/test';

/**
 * Runs the suite against the full docker-compose stack (postgres + backend + frontend),
 * so it exercises the same nginx-served production build that ships. The Postgres volume
 * persists across local runs; tests use unique names/emails to avoid collisions, but a
 * few (SCN-04, SCN-10, and any test that clicks a specific calendar slot) need a
 * predictable starting state. If those start failing locally on a rerun, run
 * `docker compose down -v` first — CI always starts from a fresh container, so this only
 * affects repeated local runs.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html'], ['github']] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  globalSetup: require.resolve('./global-setup'),
  webServer: {
    command: 'docker compose -f ../docker-compose.yml up --build',
    url: 'http://localhost:5173',
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
