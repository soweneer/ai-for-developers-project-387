namespace Cal.Domain.Entities;

public sealed record Booking(
    string Id,
    EventTypeSummary EventType,
    DateTime StartTime,
    DateTime EndTime,
    string GuestName,
    string GuestEmail,
    DateTime CreatedAt);
