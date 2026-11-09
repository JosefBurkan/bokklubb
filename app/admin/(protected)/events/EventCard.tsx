import Link from "next/link";

import DeleteEventButton from "@/app/components/DeleteEventButton";
import type { Event } from "./types";

type EventCardProps = {
  event: Event;
};

// Displays one event's details and the actions available to an admin.
export default function EventCard({ event }: EventCardProps) {
  return (
    <article className="relative flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#331F2E]/10 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#A9533D]/40 hover:shadow-lg">
      {/* Full-card link opens details; action controls are layered above it. */}
      <Link
        href={`/admin/events/${event.id}`}
        aria-label={`Se detaljer og påmeldte for ${event.description}`}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A9533D]"
      />

      {/* Event title, schedule, category, and participant count. */}
      <div className="pointer-events-none relative z-10">
        <h3 className="text-lg font-semibold text-[#331F2E]">{event.description}</h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#6A5A65]">
          <span>{new Date(event.date).toLocaleString("no-NO")}</span>
          <span>{event.category}</span>
          <span>{event.listOfParticipants?.length ?? 0} deltakere · Se påmeldte</span>
        </div>
      </div>

      {/* Keep edit and delete actions above the full-card details link. */}
      <div className="relative z-10 flex items-center gap-3">
        <Link
          href={`/admin/events/${event.id}/edit`}
          className="rounded-lg border border-[#331F2E]/20 bg-white px-4 py-2 text-sm font-semibold text-[#331F2E] transition hover:border-[#331F2E]/50 hover:bg-[#FCF3E5]"
        >
          Rediger
        </Link>
        <DeleteEventButton eventId={event.id} />
      </div>
    </article>
  );
}
