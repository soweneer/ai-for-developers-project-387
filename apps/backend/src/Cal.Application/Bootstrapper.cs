using Cal.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Cal.Application;

public static class Bootstrapper
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IEventTypeService, EventTypeService>();
        services.AddScoped<IBookingService, BookingService>();

        return services;
    }
}
