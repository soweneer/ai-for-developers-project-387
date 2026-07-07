namespace Cal.Application.Dto;

public sealed record BookingDto(
    string Id,
    EventTypeSummaryDto EventType,
    DateTime StartTime,
    DateTime EndTime,
    string GuestName,
    string GuestEmail,
    DateTime CreatedAt);
