import "@typespec/http";

using Http;

namespace CalCom;

model EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: int32;
}

model CreateEventTypeRequest {
  @minLength(1)
  name: string;

  description: string;

  @minValue(1)
  durationMinutes: int32;
}

model EventTypeSummary {
  id: string;
  name: string;
}

model TimeSlot {
  startTime: utcDateTime;
  endTime: utcDateTime;
}

model Booking {
  id: string;
  eventType: EventTypeSummary;
  startTime: utcDateTime;
  endTime: utcDateTime;
  guestName: string;
  guestEmail: string;
  createdAt: utcDateTime;
}

model CreateBookingRequest {
  eventTypeId: string;
  startTime: utcDateTime;

  @minLength(1)
  guestName: string;

  @format("email")
  guestEmail: string;
}

@error
model NotFoundError {
  @statusCode statusCode: 404;
  code: "NOT_FOUND";
  message: string;
}

@error
model ValidationError {
  @statusCode statusCode: 400;
  code: "VALIDATION_ERROR";
  message: string;
  details?: string[];
}

@error
model SlotUnavailableError {
  @statusCode statusCode: 409;
  code: "SLOT_UNAVAILABLE";
  message: string;
}
