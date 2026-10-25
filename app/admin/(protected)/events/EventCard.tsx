import Link from "next/link";

import DeleteEventButton from "@/app/components/DeleteEventButton";
import type { Event } from "./types";

type EventCardProps = {
  event: Event;
};

// Displays one event's details and the actions available to an admin.
export default function EventCard({ event }: EventCardProps) {
  return (
    <article className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Event title, schedule, category, and participant count. */}
      <div>
        <h3 className="text-lg font-semibold">{event.description}</h3>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
          <span>{new Date(event.date).toLocaleString("no-NO")}</span>
          <span>{event.category}</span>
          <span>{event.listOfParticipants?.length ?? 0} deltakere</span>
        </div>
      </div>

      {/* Admin actions for this event. */}
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/events/${event.id}/edit`}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Rediger
        </Link>
        <DeleteEventButton eventId={event.id} />
      </div>
    </article>
  );
}
