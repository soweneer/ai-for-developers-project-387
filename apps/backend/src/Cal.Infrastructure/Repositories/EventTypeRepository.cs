using Cal.Application.Repositories;
using Cal.Domain.Entities;
using Cal.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Cal.Infrastructure.Repositories;

internal sealed class EventTypeRepository(CalDbContext dbContext) : IEventTypeRepository
{
    public async Task<IReadOnlyList<EventType>> ListAsync(CancellationToken cancellationToken = default) =>
        await dbContext.EventTypes.AsNoTracking().ToListAsync(cancellationToken);

    public async Task<EventType?> GetByIdAsync(string id, CancellationToken cancellationToken = default) =>
        await dbContext.EventTypes.AsNoTracking().FirstOrDefaultAsync(eventType => eventType.Id == id, cancellationToken);

    public async Task AddAsync(EventType eventType, CancellationToken cancellationToken = default)
    {
        await dbContext.EventTypes.AddAsync(eventType, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
