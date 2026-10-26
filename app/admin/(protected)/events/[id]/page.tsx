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
    <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-4xl">
        {/* Return to the event collection. */}
        <Link
          href="/admin/events"
          className="text-sm font-medium text-white/80 hover:text-white"
        >
          ← Tilbake til eventer
        </Link>

        {/* Event details and the number of names currently registered. */}
        <header className="mb-8 mt-6">
          <h1 className="text-3xl font-bold text-white">{event.description}</h1>
          <p className="mt-2 text-white/80">
            {new Date(event.date).toLocaleString("no-NO")} · {event.category}
          </p>
          <p className="mt-2 text-white/80">
            {participants.length} {participants.length === 1 ? "påmeldt" : "påmeldte"}
          </p>
        </header>

        {/* Names added through the event signup form. */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Påmeldte deltakere</h2>
            <Link
              href={`/admin/events/${event.id}/edit`}
              className="rounded-lg bg-white px-4 py-2 font-semibold text-gray-900 hover:bg-gray-100"
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
