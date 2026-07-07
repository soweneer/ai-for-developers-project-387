using System.Net.Mail;
using Cal.Application.Dto;
using Cal.Application.Exceptions;
using Cal.Application.Repositories;
using Cal.Domain.Entities;

namespace Cal.Application.Services;

internal sealed class BookingService(IBookingRepository bookingRepository, IEventTypeRepository eventTypeRepository) : IBookingService
{
    private const int WorkDayStartHour = 9;
    private const int WorkDayEndHour = 20;

    public async Task<IReadOnlyList<BookingDto>> ListUpcomingBookingsAsync(CancellationToken cancellationToken = default)
    {
        var bookings = await bookingRepository.ListAsync(cancellationToken);
        var now = DateTime.UtcNow;

        return bookings
            .Where(booking => booking.StartTime >= now)
            .OrderBy(booking => booking.StartTime)
            .Select(ToDto)
            .ToList();
    }

    public async Task<IReadOnlyList<BusyTimeDto>> ListBusyTimesAsync(CancellationToken cancellationToken = default)
    {
        var bookings = await bookingRepository.ListAsync(cancellationToken);
        var windowEnd = DateTime.UtcNow.AddDays(15);

        return bookings
            .Where(booking => booking.StartTime <= windowEnd)
            .Select(booking => new BusyTimeDto(
                booking.StartTime,
                booking.EndTime,
                booking.EventType.Name,
                booking.GuestName,
                booking.GuestEmail))
            .ToList();
    }

    public async Task<BookingDto> CreateBookingAsync(CreateBookingRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.GuestName))
        {
            throw new ArgumentException("Guest name is required.", nameof(request));
        }

        if (!IsValidEmail(request.GuestEmail))
        {
            throw new ArgumentException("Guest email is not a valid email address.", nameof(request));
        }

        var eventType = await eventTypeRepository.GetByIdAsync(request.EventTypeId, cancellationToken)
            ?? throw new ArgumentException("Event type not found", nameof(request));

        var startTime = request.StartTime;
        var endTime = startTime.AddMinutes(eventType.DurationMinutes);

        await ValidateSlotAsync(startTime, endTime, excludeBookingId: null, cancellationToken);

        var newBooking = new Booking(
            Guid.NewGuid().ToString(),
            new EventTypeSummary(eventType.Id, eventType.Name),
            startTime,
            endTime,
            request.GuestName,
            request.GuestEmail,
            DateTime.UtcNow);

        await bookingRepository.AddAsync(newBooking, cancellationToken);
        return ToDto(newBooking);
    }

    public async Task<BookingDto> RescheduleBookingAsync(string bookingId, RescheduleBookingRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await bookingRepository.GetByIdAsync(bookingId, cancellationToken)
            ?? throw new ArgumentException($"Booking '{bookingId}' not found.", nameof(bookingId));

        var startTime = request.StartTime;
        var durationMinutes = (existing.EndTime - existing.StartTime).TotalMinutes;
        var endTime = startTime.AddMinutes(durationMinutes);

        await ValidateSlotAsync(startTime, endTime, excludeBookingId: bookingId, cancellationToken);

        var rescheduled = existing with { StartTime = startTime, EndTime = endTime };
        await bookingRepository.UpdateAsync(rescheduled, cancellationToken);
        return ToDto(rescheduled);
    }

    /// <summary>
    /// Validates that the slot [startTime, endTime) is acceptable:
    /// not in the past, within working hours (09:00–20:00 UTC), and does not
    /// conflict with any existing booking (optionally excluding a specific booking
    /// so a rescheduled booking does not conflict with itself).
    /// </summary>
    private async Task ValidateSlotAsync(
        DateTime startTime,
        DateTime endTime,
        string? excludeBookingId,
        CancellationToken cancellationToken)
    {
        // BUG-2: reject bookings in the past (allow 1-minute tolerance for network latency)
        if (startTime < DateTime.UtcNow.AddMinutes(-1))
        {
            throw new ArgumentException("Booking start time cannot be in the past.");
        }

        // BUG-1: enforce working hours 09:00–20:00 UTC
        var startHour = startTime.Hour + startTime.Minute / 60.0;
        var endHour = endTime.Hour + endTime.Minute / 60.0;
        if (startHour < WorkDayStartHour || endHour > WorkDayEndHour || startHour >= WorkDayEndHour)
        {
            throw new ArgumentException(
                $"Bookings are only allowed between {WorkDayStartHour:D2}:00 and {WorkDayEndHour:D2}:00.");
        }

        var existingBookings = await bookingRepository.ListAsync(cancellationToken);
        var hasConflict = existingBookings
            .Where(b => excludeBookingId == null || b.Id != excludeBookingId)
            .Any(b => b.StartTime < endTime && b.EndTime > startTime);

        if (hasConflict)
        {
            throw new SlotUnavailableException("The selected time slot is no longer available.");
        }
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return false;
        }

        try
        {
            return new MailAddress(email).Address == email;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private static BookingDto ToDto(Booking booking) =>
        new(
            booking.Id,
            new EventTypeSummaryDto(booking.EventType.Id, booking.EventType.Name),
            booking.StartTime,
            booking.EndTime,
            booking.GuestName,
            booking.GuestEmail,
            booking.CreatedAt);
}
