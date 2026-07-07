namespace Cal.Application.Dto;

public sealed record BusyTimeDto(DateTime StartTime, DateTime EndTime, string EventTypeName, string GuestName, string GuestEmail);
