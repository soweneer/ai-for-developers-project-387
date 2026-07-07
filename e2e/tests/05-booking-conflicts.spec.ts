import { test, expect } from '@playwright/test';
import { createEventType, futureIsoDate, uniqueEmail, uniqueName } from '../fixtures';

const API_BASE_URL = 'http://localhost:5163';

test.describe('SCN-11 overlapping bookings are rejected (regression)', () => {
  test('second booking on an overlapping slot returns 409 SLOT_UNAVAILABLE', async ({ request }) => {
    const eventType = await createEventType({ durationMinutes: 30 });
    const startTime = futureIsoDate(8, 9);

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
        startTime: futureIsoDate(9, 9),
        guestName: uniqueName(),
        guestEmail: 'not-an-email',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('email');
  });
});
