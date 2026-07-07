using Cal.Domain.Entities;

namespace Cal.Application.Repositories;

public interface IBookingRepository
{
    Task<IReadOnlyList<Booking>> ListAsync(CancellationToken cancellationToken = default);

    Task AddAsync(Booking booking, CancellationToken cancellationToken = default);
}
