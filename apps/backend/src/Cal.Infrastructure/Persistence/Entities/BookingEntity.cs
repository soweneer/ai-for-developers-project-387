namespace Cal.Infrastructure.Persistence.Entities;

public sealed class BookingEntity
{
    public required string Id { get; set; }

    public required string EventTypeId { get; set; }

    public required string EventTypeName { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public required string GuestName { get; set; }

    public required string GuestEmail { get; set; }

    public DateTime CreatedAt { get; set; }
}
