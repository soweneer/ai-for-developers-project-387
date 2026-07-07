import "@typespec/http";
import "./models.tsp";
import "./event-types.tsp";
import "./bookings.tsp";

using Http;

@service({ title: "Calendar Booking API" })
@server("https://api.example.com/v1", "Основной сервер API")
namespace CalCom;
