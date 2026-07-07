import type { Booking, BusyBooking, CreateBookingRequest, CreateEventTypeRequest, EventType } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5163';

async function parseOrThrow<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'Не удалось выполнить запрос');
  }
  return data as T;
}

export const eventTypesApi = {
  async list(): Promise<EventType[]> {
    const response = await fetch(`${API_BASE_URL}/event-types`);
    return (await response.json()) as EventType[];
  },

  async create(body: CreateEventTypeRequest): Promise<EventType> {
    const response = await fetch(`${API_BASE_URL}/event-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return parseOrThrow<EventType>(response);
  },

  async listBusyTimes(): Promise<BusyBooking[]> {
    const response = await fetch(`${API_BASE_URL}/busy-times`);
    return (await response.json()) as BusyBooking[];
  },
};

export const bookingsApi = {
  async listUpcoming(): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    return (await response.json()) as Booking[];
  },

  async create(body: CreateBookingRequest): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return parseOrThrow<Booking>(response);
  },
};
