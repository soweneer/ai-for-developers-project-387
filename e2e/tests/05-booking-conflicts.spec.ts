import { test, expect } from '@playwright/test';
import { createEventType, uniqueEmail, uniqueName } from '../fixtures';

const API_BASE_URL = 'http://localhost:5163';

/**
 * Returns an ISO 8601 datetime string for a slot N days from today at the given hour (UTC).
 */
function slotDate(daysFromNow: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

test.describe('SCN-11 overlapping bookings are rejected (regression)', () => {
  test('second booking on an overlapping slot returns 409 SLOT_UNAVAILABLE', async ({ request }) => {
    const eventType = await createEventType({ durationMinutes: 30 });
    const startTime = slotDate(8, 9);

    const first = await request.post(`${API_BASE_URL}/bookings`, {
      data: { eventTypeId: eventType.id, startTime, guestName: uniqueName(), guestEmail: uniqueEmail() },
    });
    expect(first.status()).toBe(201);

    const second = await request.post(`${API_BASE_URL}/bookings`, {
      data: { eventTypeId: eventType.id, startTime, guestName: uniqueName(), guestEmail: uniqueEmail() },
    });
    expect(second.status()).toBe(409);
    const body = await second.json();
    expect(body.code).toBe('SLOT_UNAVAILABLE');
  });
});

test.describe('SCN-12 invalid guest email is rejected (regression)', () => {
  test('booking with a malformed email returns 400', async ({ request }) => {
    const eventType = await createEventType();

    const response = await request.post(`${API_BASE_URL}/bookings`, {
      data: {
        eventTypeId: eventType.id,
        startTime: slotDate(9, 9),
        guestName: uniqueName(),
        guestEmail: 'not-an-email',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('email');
  });
});

test.describe('BUG-2 past-time booking is rejected (regression)', () => {
  test('booking with a startTime in the past returns 400', async ({ request }) => {
    const eventType = await createEventType({ durationMinutes: 30 });
    // 2 hours ago
    const pastTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const response = await request.post(`${API_BASE_URL}/bookings`, {
      data: {
        eventTypeId: eventType.id,
        startTime: pastTime,
        guestName: uniqueName(),
        guestEmail: uniqueEmail(),
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('past');
  });
});

test.describe('BUG-1 out-of-working-hours booking is rejected (regression)', () => {
  test('booking starting before 08:00 UTC returns 400', async ({ request }) => {
    const eventType = await createEventType({ durationMinutes: 30 });

    const response = await request.post(`${API_BASE_URL}/bookings`, {
      data: {
        eventTypeId: eventType.id,
        startTime: slotDate(3, 6), // 06:00 UTC — before working window
        guestName: uniqueName(),
        guestEmail: uniqueEmail(),
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('08:00');
  });

  test('booking ending after 20:00 UTC returns 400', async ({ request }) => {
    const eventType = await createEventType({ durationMinutes: 60 });

    const response = await request.post(`${API_BASE_URL}/bookings`, {
      data: {
        eventTypeId: eventType.id,
        startTime: slotDate(3, 19, 30), // 19:30 UTC + 60 min = 20:30 — exceeds window
        guestName: uniqueName(),
        guestEmail: uniqueEmail(),
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('08:00');
  });

  test('booking exactly at 08:00 UTC start is accepted', async ({ request }) => {
    const eventType = await createEventType({ durationMinutes: 30 });

    const response = await request.post(`${API_BASE_URL}/bookings`, {
      data: {
        eventTypeId: eventType.id,
        startTime: slotDate(5, 8), // 08:00 UTC — exactly on boundary
        guestName: uniqueName(),
        guestEmail: uniqueEmail(),
      },
    });

    expect(response.status()).toBe(201);
  });
});
