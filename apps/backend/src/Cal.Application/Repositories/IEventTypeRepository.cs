using Cal.Domain.Entities;

namespace Cal.Application.Repositories;

public interface IEventTypeRepository
{
    Task<IReadOnlyList<EventType>> ListAsync(CancellationToken cancellationToken = default);

    Task<EventType?> GetByIdAsync(string id, CancellationToken cancellationToken = default);

    Task AddAsync(EventType eventType, CancellationToken cancellationToken = default);
}
