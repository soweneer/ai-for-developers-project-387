import "@typespec/http";
import "./models.tsp";

using Http;

namespace CalCom;

@route("/event-types")
interface EventTypes {
  @get
  list(): EventType[];

  @get
  get(@path id: string): EventType | NotFoundError;

  @post
  create(@body body: CreateEventTypeRequest): {
    @statusCode statusCode: 201;
    ...EventType;
  } | ValidationError;

  @route("/{id}/slots")
  @get
  listSlots(@path id: string): TimeSlot[] | NotFoundError;
}
