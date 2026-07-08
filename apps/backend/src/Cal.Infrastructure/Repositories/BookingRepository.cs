using Cal.Application.Repositories;
using Cal.Domain.Entities;
using Cal.Infrastructure.Persistence;
using Cal.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cal.Infrastructure.Repositories;

internal sealed class BookingRepository(CalDbContext dbContext) : IBookingRepository
{
    public async Task<IReadOnlyList<Booking>> ListAsync(CancellationToken cancellationToken = default)
    {
        var entities = await dbContext.Bookings.AsNoTracking().ToListAsync(cancellationToken);
        return entities.Select(ToDomain).ToList();
    }

    public async Task<Booking?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Bookings.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
        return entity is null ? null : ToDomain(entity);
    }

    public async Task AddAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        await dbContext.Bookings.AddAsync(ToEntity(booking), cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Bookings.FirstOrDefaultAsync(b => b.Id == booking.Id, cancellationToken);
        if (entity is null)
        {
            throw new InvalidOperationException($"Booking '{booking.Id}' not found.");
        }

        entity.StartTime = booking.StartTime;
        entity.EndTime = booking.EndTime;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static Booking ToDomain(BookingEntity entity) =>
        new(
            entity.Id,
            new EventTypeSummary(entity.EventTypeId, entity.EventTypeName),
            entity.StartTime,
            entity.EndTime,
            entity.GuestName,
            entity.GuestEmail,
            entity.CreatedAt);

    private static BookingEntity ToEntity(Booking booking) =>
        new()
        {
            Id = booking.Id,
            EventTypeId = booking.EventType.Id,
            EventTypeName = booking.EventType.Name,
            StartTime = booking.StartTime,
            EndTime = booking.EndTime,
            GuestName = booking.GuestName,
            GuestEmail = booking.GuestEmail,
            CreatedAt = booking.CreatedAt,
        };
}
