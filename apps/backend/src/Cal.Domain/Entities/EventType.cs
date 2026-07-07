namespace Cal.Domain.Entities;

public sealed record EventType(string Id, string Name, string Description, int DurationMinutes);
