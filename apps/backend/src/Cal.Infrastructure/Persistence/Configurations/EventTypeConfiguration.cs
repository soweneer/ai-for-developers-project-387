using Cal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Cal.Infrastructure.Persistence.Configurations;

public sealed class EventTypeConfiguration : IEntityTypeConfiguration<EventType>
{
    public void Configure(EntityTypeBuilder<EventType> builder)
    {
        builder.ToTable("EventTypes");

        builder.HasKey(eventType => eventType.Id);

        builder.Property(eventType => eventType.Id)
            .HasMaxLength(64);

        builder.Property(eventType => eventType.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(eventType => eventType.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(eventType => eventType.DurationMinutes)
            .IsRequired();
    }
}
