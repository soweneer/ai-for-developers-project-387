using Cal.Domain.Entities;
using Cal.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cal.Infrastructure.Persistence;

public sealed class CalDbContext(DbContextOptions<CalDbContext> options) : DbContext(options)
{
    public DbSet<EventType> EventTypes => Set<EventType>();

    public DbSet<BookingEntity> Bookings => Set<BookingEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CalDbContext).Assembly);
    }
}
