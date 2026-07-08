using Cal.Application;
using Cal.Application.Dto;
using Cal.Application.Exceptions;
using Cal.Application.Services;
using Cal.Infrastructure;
using Cal.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CalDbContext>();
    await dbContext.Database.MigrateAsync();
}

app.UseHttpsRedirection();
app.UseCors();

app.MapGet("/", () => "Hello world")
    .WithName("GetHello");

app.MapGet("/event-types", (IEventTypeService eventTypeService) => eventTypeService.ListEventTypesAsync())
    .WithName("ListEventTypes");

app.MapGet("/event-types/{id}", async (string id, IEventTypeService eventTypeService) =>
        await eventTypeService.GetEventTypeAsync(id) is { } eventType ? Results.Ok(eventType) : Results.NotFound())
    .WithName("GetEventType");

app.MapPost("/event-types", async (CreateEventTypeRequest body, IEventTypeService eventTypeService) =>
    {
        try
        {
            var eventTypeDto = await eventTypeService.CreateEventTypeAsync(body);
            return Results.Created($"/event-types/{eventTypeDto.Id}", eventTypeDto);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    })
    .WithName("CreateEventType");

app.MapGet("/busy-times", (IBookingService bookingService) => bookingService.ListBusyTimesAsync())
    .WithName("ListBusyTimes");

app.MapGet("/bookings", (IBookingService bookingService) => bookingService.ListUpcomingBookingsAsync())
    .WithName("ListUpcomingBookings");

app.MapPost("/bookings", async (CreateBookingRequest body, IBookingService bookingService) =>
    {
        try
        {
            var bookingDto = await bookingService.CreateBookingAsync(body);
            return Results.Created($"/bookings/{bookingDto.Id}", bookingDto);
        }
        catch (SlotUnavailableException ex)
        {
            return Results.Conflict(new { error = ex.Message, code = "SLOT_UNAVAILABLE" });
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    })
    .WithName("CreateBooking");

app.MapPatch("/bookings/{id}", async (string id, RescheduleBookingRequest body, IBookingService bookingService) =>
    {
        try
        {
            var bookingDto = await bookingService.RescheduleBookingAsync(id, body);
            return Results.Ok(bookingDto);
        }
        catch (SlotUnavailableException ex)
        {
            return Results.Conflict(new { error = ex.Message, code = "SLOT_UNAVAILABLE" });
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    })
    .WithName("RescheduleBooking");

app.Run();
