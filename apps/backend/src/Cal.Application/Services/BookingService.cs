using System.Net.Mail;
using Cal.Application.Dto;
using Cal.Application.Exceptions;
using Cal.Application.Repositories;
using Cal.Domain.Entities;

namespace Cal.Application.Services;

internal sealed class BookingService(IBookingRepository bookingRepository, IEventTypeRepository eventTypeRepository) : IBookingService
{
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

        var existingBookings = await bookingRepository.ListAsync(cancellationToken);
        var hasConflict = existingBookings.Any(booking => booking.StartTime < endTime && booking.EndTime > startTime);
        if (hasConflict)
        {
            throw new SlotUnavailableException("The selected time slot is no longer available.");
        }

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
