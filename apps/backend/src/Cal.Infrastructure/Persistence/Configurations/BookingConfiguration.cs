using Cal.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cal.Infrastructure.Persistence.Configurations;

public sealed class BookingConfiguration : IEntityTypeConfiguration<BookingEntity>
{
    public void Configure(EntityTypeBuilder<BookingEntity> builder)
    {
        builder.ToTable("Bookings");

        builder.HasKey(booking => booking.Id);

        builder.Property(booking => booking.Id)
            .HasMaxLength(64);

        builder.Property(booking => booking.EventTypeId)
            .IsRequired()
            .HasMaxLength(64);

        builder.Property(booking => booking.EventTypeName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(booking => booking.StartTime)
            .IsRequired();

        builder.Property(booking => booking.EndTime)
            .IsRequired();

        builder.Property(booking => booking.GuestName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(booking => booking.GuestEmail)
            .IsRequired()
            .HasMaxLength(320);

        builder.Property(booking => booking.CreatedAt)
            .IsRequired();
    }
}
