import "@typespec/http";
import "./models.tsp";

using Http;

namespace CalCom;

@route("/bookings")
interface Bookings {
  @get
  listUpcoming(): Booking[];

  @post
  create(@body body: CreateBookingRequest): {
    @statusCode statusCode: 201;
    ...Booking;
  } | NotFoundError | ValidationError | SlotUnavailableError;
}
