import Link from "next/link";

import DeleteEventButton from "@/app/components/DeleteEventButton";
import type { Event } from "./types";

type EventCardProps = {
  event: Event;
};

const CATEGORY_STYLES: Record<string, string> = {
  Sosial: "bg-[#F2DDD5] text-[#813E31]",
  Aktivitet: "bg-[#F1E4BD] text-[#735313]",
  Annet: "bg-[#E8D9E4] text-[#68465F]",
};

// Displays an event with its date, category, attendance, and admin actions.
export default function EventCard({ event }: EventCardProps) {
  const date = new Date(event.date);
  const dateBlockFormat = { timeZone: "Europe/Oslo" };
  const day = new Intl.DateTimeFormat("nb-NO", { ...dateBlockFormat, day: "numeric" }).format(date);
  const month = new Intl.DateTimeFormat("nb-NO", { ...dateBlockFormat, month: "short" }).format(date);
  const weekday = new Intl.DateTimeFormat("nb-NO", { ...dateBlockFormat, weekday: "long" }).format(date);
  const dateAndTime = new Intl.DateTimeFormat("nb-NO", {
    ...dateBlockFormat,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  const categoryStyle = CATEGORY_STYLES[event.category] ?? "bg-[#EAE3DC] text-[#594653]";

  return (
    <article className="relative flex flex-col gap-4 rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-4 shadow-[0_4px_16px_rgba(51,31,46,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#A9533D]/50 hover:shadow-[0_12px_28px_rgba(51,31,46,0.12)] sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      {/* The full-card link opens attendee details; action controls sit above it. */}
      <Link
        href={`/admin/events/${event.id}`}
        aria-label={`Se detaljer og påmeldte for ${event.description}`}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A9533D]"
      />

      {/* A compact date block makes the schedule easy to scan in the list. */}
      <div aria-hidden="true" className="relative z-10 flex shrink-0 items-center gap-3 rounded-xl bg-[#E8D9E4] px-4 py-3 text-center sm:w-[5.5rem] sm:flex-col sm:gap-0 sm:px-2 sm:py-4">
        <span className="font-display text-3xl font-semibold leading-none text-[#493447]">{day}</span>
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#76576F]">{month.replace(".", "")}</span>
        <span className="ml-auto text-xs text-[#594653] sm:ml-0 sm:mt-2 sm:text-[11px]">{weekday}</span>
      </div>

      {/* The title leads; the badge and metadata provide quick context. */}
      <div className="pointer-events-none relative z-10 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="text-lg font-semibold text-[#331F2E]">{event.description}</h3>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryStyle}`}>
            {event.category}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#5D4B57]">
          <time dateTime={date.toISOString()}>{dateAndTime}</time>
          <span>{event.listOfParticipants?.length ?? 0} deltakere</span>
          <span className="font-semibold text-[#76576F]">Se påmeldte</span>
        </div>
      </div>

      {/* Edit and delete remain separate from the full-card details link. */}
      <div className="relative z-10 flex items-center gap-2 sm:ml-auto">
        <Link
          href={`/admin/events/${event.id}/edit`}
          className="rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-2 text-sm font-semibold text-[#331F2E] transition hover:border-[#8F7687] hover:bg-[#F0E7DE]"
        >
          Rediger
        </Link>
        <DeleteEventButton eventId={event.id} />
      </div>
    </article>
  );
}
