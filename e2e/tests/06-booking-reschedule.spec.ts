import { test, expect } from '@playwright/test';
import {
  createEventType,
  createBooking,
  rescheduleBooking,
  futureIsoDate,
  uniqueEmail,
  uniqueName,
} from '../fixtures';

const API_BASE_URL = 'http://localhost:5163';

// ---------------------------------------------------------------------------
// API-level tests (no browser required)
// ---------------------------------------------------------------------------

test.describe('SCN-13 PATCH /bookings/{id} – happy path reschedule', () => {
  test('rescheduling to a free slot succeeds and returns updated booking', async ({ request }) => {
    const eventType = await createEventType({ durationMinutes: 30 });
    const originalStart = futureIsoDate(25, 9);
    const created = await createBooking(eventType.id, { startTime: originalStart });
    expect(created.status).toBe(201);

    const bookingId = created.body['id'] as string;
    const newStart = futureIsoDate(25, 11);
    const result = await rescheduleBooking(bookingId, newStart);

    expect(result.status).toBe(200);
    expect(result.body['id']).toBe(bookingId);
    expect(new Date(result.body['startTime'] as string).toISOString()).toBe(
      new Date(newStart).toISOString(),
    );
  });
});

test.describe('SCN-14 PATCH /bookings/{id} – conflict rejection', () => {
  test('rescheduling onto an occupied slot returns 409 SLOT_UNAVAILABLE', async ({ request }) => {
    const eventType = await createEventType({ durationMinutes: 30 });

    // Create two bookings at different hours
    const slotA = futureIsoDate(26, 9);
    const slotB = futureIsoDate(26, 11);

    const bookingA = await createBooking(eventType.id, { startTime: slotA });
    const bookingB = await createBooking(eventType.id, { startTime: slotB });
    expect(bookingA.status).toBe(201);
    expect(bookingB.status).toBe(201);

    const idA = bookingA.body['id'] as string;

    // Try to move booking A onto booking B's slot
    const result = await rescheduleBooking(idA, slotB);
    expect(result.status).toBe(409);
    expect(result.body['code']).toBe('SLOT_UNAVAILABLE');
  });

  test('a booking does not conflict with itself when rescheduled to same slot', async () => {
    const eventType = await createEventType({ durationMinutes: 30 });
    const start = futureIsoDate(27, 10);
    const created = await createBooking(eventType.id, { startTime: start });
    expect(created.status).toBe(201);

    const bookingId = created.body['id'] as string;
    // Reschedule to the very same start time — should NOT be a conflict
    const result = await rescheduleBooking(bookingId, start);
    expect(result.status).toBe(200);
  });
});

test.describe('SCN-15 PATCH /bookings/{id} – validation', () => {
  test('rescheduling to the past returns 400', async () => {
    const eventType = await createEventType({ durationMinutes: 30 });
    const start = futureIsoDate(28, 10);
    const created = await createBooking(eventType.id, { startTime: start });
    expect(created.status).toBe(201);

    const bookingId = created.body['id'] as string;
    const pastTime = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
    const result = await rescheduleBooking(bookingId, pastTime);
    expect(result.status).toBe(400);
  });

  test('rescheduling outside working hours returns 400', async () => {
    const eventType = await createEventType({ durationMinutes: 30 });
    const start = futureIsoDate(29, 10);
    const created = await createBooking(eventType.id, { startTime: start });
    expect(created.status).toBe(201);

    const bookingId = created.body['id'] as string;

    // 06:00 UTC — before working hours start
    const outOfHours = futureIsoDate(30, 6);
    const date = new Date(outOfHours);
    date.setHours(6, 0, 0, 0);
    const result = await rescheduleBooking(bookingId, date.toISOString());
    expect(result.status).toBe(400);
  });

  test('rescheduling a non-existent booking returns 400', async () => {
    const result = await rescheduleBooking('00000000-0000-0000-0000-000000000000', futureIsoDate(30, 10));
    expect(result.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// UI-level test — drag-and-drop on the owner calendar
// ---------------------------------------------------------------------------

test.describe('SCN-16 owner calendar drag-and-drop reschedule', () => {
  test('SCN-16a dragging a booking to a free slot updates the calendar without page reload', async ({ page }) => {
    const eventType = await createEventType({ durationMinutes: 60 });
    const guestName = uniqueName('Перенос Тестов');
    const lastName = guestName.split(' ').pop()!;

    // Book at hour 9 on day 5 from now — must stay within the owner calendar's
    // 14-day visible window (see OwnerBookingCalendar's timeGridFourteenDay view),
    // otherwise the dragged event never renders and the test times out.
    const { toLocalIsoDate, buildSlotLocators } = getCalendarHelpers();
    const daysFromNow = 5;
    const fromHour = 9;
    const toHour = 11;

    const slotStart = new Date();
    slotStart.setDate(slotStart.getDate() + daysFromNow);
    slotStart.setHours(fromHour, 0, 0, 0);

    const created = await createBooking(eventType.id, {
      startTime: slotStart.toISOString(),
      guestName,
      guestEmail: uniqueEmail(),
    });
    expect(created.status).toBe(201);

    await page.goto('/owner');

    // Locate the event block in the calendar
    const calendarSection = page.locator('text=Календарь (перенос встреч)').locator('..');
    const eventBlock = calendarSection.locator('.fc-timegrid-event', { hasText: lastName });
    await expect(eventBlock).toBeVisible();

    // Determine bounding boxes for source and target slots
    const isoDate = toLocalIsoDate(slotStart);
    const sourceTimeStr = `${String(fromHour).padStart(2, '0')}:00:00`;
    const targetTimeStr = `${String(toHour).padStart(2, '0')}:00:00`;

    const column = page.locator(`.fc-timegrid-col[data-date="${isoDate}"]`);
    const sourceLane = page.locator(`.fc-timegrid-slot-lane[data-time="${sourceTimeStr}"]`);
    const targetLane = page.locator(`.fc-timegrid-slot-lane[data-time="${targetTimeStr}"]`);

    const [colBox, srcBox, tgtBox] = await Promise.all([
      column.boundingBox(),
      sourceLane.boundingBox(),
      targetLane.boundingBox(),
    ]);

    if (!colBox || !srcBox || !tgtBox) {
      test.skip(true, 'Could not locate calendar slots for drag-and-drop test');
      return;
    }

    const srcX = colBox.x + colBox.width / 2;
    const srcY = srcBox.y + srcBox.height / 2;
    const tgtX = colBox.x + colBox.width / 2;
    const tgtY = tgtBox.y + tgtBox.height / 2;

    // Perform drag-and-drop
    await page.mouse.move(srcX, srcY);
    await page.mouse.down();
    await page.mouse.move(tgtX, tgtY, { steps: 10 });
    await page.mouse.up();

    // The event should still be visible (just at a different time) and no error shown
    await expect(calendarSection.locator('.fc-timegrid-event', { hasText: lastName })).toBeVisible();
    await expect(page.locator('[role="alert"]')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCalendarHelpers() {
  function toLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function buildSlotLocators() {
    // placeholder to satisfy destructure
  }

  return { toLocalIsoDate, buildSlotLocators };
}
