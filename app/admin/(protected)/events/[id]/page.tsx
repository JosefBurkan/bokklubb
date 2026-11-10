import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { createClient } from "@/supabase/server";
import EventParticipants from "../EventParticipants";

type EventDetailsPageProps = {
  params: Promise<{ id: string }>;
};

// Loads one event and its current signup names for the admin detail view.
export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: event, error } = await supabase
    .from("eventer")
    .select("id, date, description, category, listOfParticipants")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Could not fetch event details:", error.message);
    throw new Error("Kunne ikke hente eventet.");
  }

  if (!event) {
    notFound();
  }

  // Prefer registration rows when available; the array supports the older signup flow.
  const { data: registrations, error: registrationsError } = await supabase
    .from("event_registrations")
    .select("participant_name")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true });

  if (registrationsError) {
    console.error("Could not fetch event registrations:", registrationsError.message);
  }

  const registeredNames = (registrations ?? [])
    .map((registration) => registration.participant_name?.trim())
    .filter((name): name is string => Boolean(name));
  const participants = registeredNames.length > 0
    ? registeredNames
    : event.listOfParticipants ?? [];

  return (
    <main className="min-h-full flex-1 bg-[#E2D9D0] px-6 py-10 text-[#331F2E] sm:py-14">
      <div className="mx-auto max-w-4xl">
        {/* Return to the event collection. */}
        <Link
          href="/admin/events"
          className="text-sm font-semibold text-[#6A465E] underline decoration-[#C99B72] underline-offset-4 hover:text-[#A9533D]"
        >
          ← Tilbake til eventer
        </Link>

        {/* Event details and the number of names currently registered. */}
        <header className="mb-8 mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A9533D]">Arrangementsdetaljer</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#331F2E] sm:text-4xl">{event.description}</h1>
          <p className="mt-2 text-[#5C3C54]">
            {new Date(event.date).toLocaleString("no-NO")} · {event.category}
          </p>
          <p className="mt-2 text-sm font-semibold text-[#5C3C54]">
            {participants.length} {participants.length === 1 ? "påmeldt" : "påmeldte"}
          </p>
        </header>

        {/* Names added through the event signup form. */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-[#331F2E]">Påmeldte deltakere</h2>
            <Link
              href={`/admin/events/${event.id}/edit`}
              className="rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-2 font-semibold text-[#331F2E] hover:bg-[#F0E7DE]"
            >
              Rediger event
            </Link>
          </div>
          <EventParticipants participants={event.listOfParticipants} />
        </section>
      </div>
    </main>
  );
}
