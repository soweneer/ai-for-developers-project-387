import { test, expect } from '@playwright/test';
import { createEventType, createBooking, uniqueEmail, uniqueName } from '../fixtures';

test.describe('SCN-09 owner dashboard reflects new booking', () => {
  test('lists a booking created via the API', async ({ page }) => {
    const eventType = await createEventType({ durationMinutes: 30 });
    const guestName = uniqueName('Дашборд Гостев');
    const guestEmail = uniqueEmail();
    const result = await createBooking(eventType.id, { guestName, guestEmail });
    expect(result.status).toBe(201);

    await page.goto('/owner');
    const row = page.getByRole('row').filter({ hasText: guestEmail });
    await expect(row).toBeVisible();
    await expect(row).toContainText(guestName);
    await expect(row).toContainText(eventType.name);
  });
});
