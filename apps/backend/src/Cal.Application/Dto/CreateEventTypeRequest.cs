namespace Cal.Application.Dto;

public sealed record CreateEventTypeRequest(string Name, string Description, int DurationMinutes);
