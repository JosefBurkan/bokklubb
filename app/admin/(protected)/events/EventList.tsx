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
        <p className="rounded-xl border border-[#D0C1B5] bg-[#F7F1E9] p-8 text-center text-[#5D4B57] shadow-[0_4px_16px_rgba(51,31,46,0.06)]">
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
