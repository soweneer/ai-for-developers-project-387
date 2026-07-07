using Cal.Application.Dto;

namespace Cal.Application.Services;

public interface IBookingService
{
    Task<IReadOnlyList<BookingDto>> ListUpcomingBookingsAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<BusyTimeDto>> ListBusyTimesAsync(CancellationToken cancellationToken = default);

    Task<BookingDto> CreateBookingAsync(CreateBookingRequest request, CancellationToken cancellationToken = default);
}
