const API_BASE_URL = 'http://localhost:5163';

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface BookingResult {
  status: number;
  body: Record<string, unknown>;
}

export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function uniqueName(prefix = 'E2E Guest'): string {
  return `${prefix} ${uniqueSuffix()}`;
}

export function uniqueEmail(): string {
  return `e2e-${uniqueSuffix()}@example.com`;
}

/**
 * Returns an ISO datetime in the future. When daysFromNow/hour are omitted, both are
 * randomized across a wide range so unrelated fixture calls (and repeated local runs
 * against the same persistent database) don't collide on the same slot — the backend
 * treats the whole calendar as a single shared resource, so any two bookings anywhere
 * in the suite must land on non-overlapping times unless a test deliberately wants that.
 */
export function futureIsoDate(daysFromNow?: number, hour?: number): string {
  const date = new Date();
  date.setDate(date.getDate() + (daysFromNow ?? randomInt(2, 14)));
  date.setHours(hour ?? randomInt(8, 19), 0, 0, 0);
  return date.toISOString();
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export async function createEventType(
  overrides: Partial<{ name: string; description: string; durationMinutes: number }> = {},
): Promise<EventType> {
  const response = await fetch(`${API_BASE_URL}/event-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: overrides.name ?? `E2E Type ${uniqueSuffix()}`,
      description: overrides.description ?? 'Created by e2e fixture',
      durationMinutes: overrides.durationMinutes ?? 30,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create event type: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

export async function createBooking(
  eventTypeId: string,
  overrides: Partial<{ startTime: string; guestName: string; guestEmail: string }> = {},
): Promise<BookingResult> {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventTypeId,
      startTime: overrides.startTime ?? futureIsoDate(),
      guestName: overrides.guestName ?? uniqueName(),
      guestEmail: overrides.guestEmail ?? uniqueEmail(),
    }),
  });

  return { status: response.status, body: await response.json() };
}
