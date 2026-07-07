using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cal.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    EventTypeId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    EventTypeName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GuestName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    GuestEmail = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EventTypes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventTypes", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "EventTypes",
                columns: new[] { "Id", "Name", "Description", "DurationMinutes" },
                values: new object[,]
                {
                    { "evt-1", "Короткая консультация", "Быстрый созвон, чтобы обсудить вопрос", 15 },
                    { "evt-2", "Подробная встреча", "Развёрнутое обсуждение проекта", 30 },
                });

            migrationBuilder.InsertData(
                table: "Bookings",
                columns: new[] { "Id", "EventTypeId", "EventTypeName", "StartTime", "EndTime", "GuestName", "GuestEmail", "CreatedAt" },
                values: new object[,]
                {
                    { "bkg-1", "evt-1", "Короткая консультация", new DateTime(2026, 7, 7, 10, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 7, 10, 15, 0, DateTimeKind.Utc), "Анна Смирнова", "anna.smirnova@example.com", new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) },
                    { "bkg-2", "evt-2", "Подробная встреча", new DateTime(2026, 7, 8, 14, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 8, 14, 30, 0, DateTimeKind.Utc), "Игорь Петров", "igor.petrov@example.com", new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) },
                    { "bkg-3", "evt-1", "Короткая консультация", new DateTime(2026, 7, 9, 9, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 9, 9, 15, 0, DateTimeKind.Utc), "Мария Кузнецова", "maria.kuznecova@example.com", new DateTime(2026, 7, 6, 0, 0, 0, DateTimeKind.Utc) },
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "EventTypes");
        }
    }
}
