import { test, expect } from '@playwright/test';

/**
 * SCN-04 and SCN-10 require a database with no event types / no bookings yet, so this file
 * must run before any other spec creates data. The "00-" filename prefix plus `workers: 1`
 * in playwright.config.ts keeps file execution order stable within a single run.
 *
 * Locally, re-running the suite against the same persistent docker-compose Postgres volume
 * will accumulate data from previous runs and these tests will start failing — run
 * `docker compose down -v` between local runs if that happens. In CI each run starts from a
 * fresh Postgres container, so this is not an issue there.
 */

test.describe('SCN-04 guest empty state', () => {
  test('shows a message and no calendar when there are no event types', async ({ page }) => {
    await page.goto('/guest');
    await expect(page.getByText('Владелец ещё не создал ни одного типа события')).toBeVisible();
    await expect(page.locator('.fc-timegrid-body')).toHaveCount(0);
  });
});

test.describe('SCN-10 owner dashboard empty state', () => {
  test('shows a message and no table when there are no bookings', async ({ page }) => {
    await page.goto('/owner');
    await expect(page.getByText('Пока нет назначенных встреч')).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);
  });
});
