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

    public async Task AddAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        await dbContext.Bookings.AddAsync(ToEntity(booking), cancellationToken);
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
