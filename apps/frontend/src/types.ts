export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface CreateEventTypeRequest {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface EventTypeSummary {
  id: string;
  name: string;
}

export interface BusyBooking {
  startTime: string;
  endTime: string;
  eventTypeName: string;
  guestName: string;
  guestEmail: string;
}

export interface Booking {
  id: string;
  eventType: EventTypeSummary;
  startTime: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  eventTypeId: string;
  startTime: string;
  guestName: string;
  guestEmail: string;
}
