using Cal.Application.Dto;
using Cal.Application.Repositories;
using Cal.Domain.Entities;

namespace Cal.Application.Services;

internal sealed class EventTypeService(IEventTypeRepository eventTypeRepository) : IEventTypeService
{
    public async Task<IReadOnlyList<EventTypeDto>> ListEventTypesAsync(CancellationToken cancellationToken = default)
    {
        var eventTypes = await eventTypeRepository.ListAsync(cancellationToken);
        return eventTypes.Select(ToDto).ToList();
    }

    public async Task<EventTypeDto?> GetEventTypeAsync(string id, CancellationToken cancellationToken = default)
    {
        var eventType = await eventTypeRepository.GetByIdAsync(id, cancellationToken);
        return eventType is null ? null : ToDto(eventType);
    }

    public async Task<EventTypeDto> CreateEventTypeAsync(CreateEventTypeRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Name is required.", nameof(request));
        }

        if (request.DurationMinutes <= 0 || request.DurationMinutes % 15 != 0)
        {
            throw new ArgumentException("Duration must be a positive multiple of 15 minutes.", nameof(request));
        }

        var eventType = new EventType(Guid.NewGuid().ToString(), request.Name, request.Description, request.DurationMinutes);
        await eventTypeRepository.AddAsync(eventType, cancellationToken);
        return ToDto(eventType);
    }

    private static EventTypeDto ToDto(EventType eventType) =>
        new(eventType.Id, eventType.Name, eventType.Description, eventType.DurationMinutes);
}
