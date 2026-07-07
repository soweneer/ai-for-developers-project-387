using Cal.Application.Repositories;
using Cal.Infrastructure.Persistence;
using Cal.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Cal.Infrastructure;

public static class Bootstrapper
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Connection string 'Default' is not configured.");

        services.AddDbContext<CalDbContext>(options => options.UseNpgsql(connectionString));

        services.AddScoped<IEventTypeRepository, EventTypeRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();

        return services;
    }
}
