namespace Cal.Application.Dto;

public sealed record CreateBookingRequest(string EventTypeId, DateTime StartTime, string GuestName, string GuestEmail);
