import { test, expect } from '@playwright/test';
import { createEventType, createBooking, uniqueEmail, uniqueName } from '../fixtures';
import { clickCalendarSlot, pickSlot } from '../calendar';

test.describe('SCN-05/06 guest booking form', () => {
  test('SCN-05 completes a booking end-to-end', async ({ page }) => {
    const eventType = await createEventType({ durationMinutes: 30 });
    const guestName = uniqueName('Гость Тестов');
    const guestEmail = uniqueEmail();
    const slot = pickSlot(4, 11);

    await page.goto('/guest');
    await clickCalendarSlot(page, slot);

    // Mantine's SegmentedControl visually hides the native radio input (zero-size,
    // off-screen), so clicking it directly fails actionability checks even with
    // `force`. Click the associated visible label text instead.
    await page.getByRole('dialog').getByText(eventType.name, { exact: true }).click();
    await page.getByLabel('Ваше имя').fill(guestName);
    await page.getByLabel('Email').fill(guestEmail);
    await page.getByRole('button', { name: 'Назначить встречу' }).click();

    await expect(page.getByRole('heading', { name: 'Встреча назначена!' })).toBeVisible();
    await expect(page.getByText(/Время встречи:/)).toBeVisible();
  });

  test('SCN-06 shows a validation error for empty name/email', async ({ page }) => {
    const eventType = await createEventType();
    const slot = pickSlot(4, 12);

    await page.goto('/guest');
    await clickCalendarSlot(page, slot);
    // Mantine's SegmentedControl visually hides the native radio input (zero-size,
    // off-screen), so clicking it directly fails actionability checks even with
    // `force`. Click the associated visible label text instead.
    await page.getByRole('dialog').getByText(eventType.name, { exact: true }).click();
    await page.getByRole('button', { name: 'Назначить встречу' }).click();

    await expect(page.getByText('Укажите имя и email')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Встреча назначена!' })).not.toBeVisible();
  });
});

test.describe('SCN-07/08 calendar busy slot behavior', () => {
  test('SCN-07 clicking an already-booked slot is a no-op', async ({ page }) => {
    const eventType = await createEventType({ durationMinutes: 30 });
    const slot = pickSlot(6, 10);
    const created = await createBooking(eventType.id, { startTime: slot.toISOString() });
    expect(created.status).toBe(201);

    await page.goto('/guest');
    await clickCalendarSlot(page, slot);

    await expect(page.getByRole('dialog', { name: 'Новая встреча' })).not.toBeVisible();
  });

  test('SCN-08 clicking a busy block shows read-only details', async ({ page }) => {
    const eventType = await createEventType({ durationMinutes: 30 });
    const guestName = uniqueName('Занятое Времяев');
    const lastToken = guestName.split(' ').pop()!;
    const slot = pickSlot(7, 15);
    const created = await createBooking(eventType.id, { startTime: slot.toISOString(), guestName });
    expect(created.status).toBe(201);

    await page.goto('/guest');
    await page.locator('.fc-timegrid-event', { hasText: lastToken }).click();

    const dialog = page.getByRole('dialog', { name: 'Занятое время' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(eventType.name)).toBeVisible();
    await expect(dialog.getByText(guestName)).toBeVisible();
  });
});
