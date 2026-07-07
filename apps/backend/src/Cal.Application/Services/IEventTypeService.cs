using Cal.Application.Dto;

namespace Cal.Application.Services;

public interface IEventTypeService
{
    Task<IReadOnlyList<EventTypeDto>> ListEventTypesAsync(CancellationToken cancellationToken = default);

    Task<EventTypeDto?> GetEventTypeAsync(string id, CancellationToken cancellationToken = default);

    Task<EventTypeDto> CreateEventTypeAsync(CreateEventTypeRequest request, CancellationToken cancellationToken = default);
}
