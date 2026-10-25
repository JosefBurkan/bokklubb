import EventCard from "./EventCard";
import type { Event } from "./types";

type EventListProps = {
  events: Event[];
};

// Handles the empty state and maps each event to its own display component.
export default function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <>
        {/* Empty state shown when the database contains no events. */}
        <p className="rounded-xl bg-white p-8 text-center text-gray-500">
          Ingen eventer er opprettet ennå.
        </p>
      </>
    );
  }

  return (
    <>
      {/* One card per event; each card owns its display and admin actions. */}
      <div className="grid gap-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </>
  );
}
