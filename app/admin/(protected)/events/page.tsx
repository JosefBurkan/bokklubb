import { cookies } from "next/headers";

import { createClient } from "@/supabase/server";

import AdminBackLink from "../AdminBackLink";
import EventList from "./EventList";
import Link from "next/link";

// Server page: loads events from Supabase, then passes them to the list UI.
export default async function AdminEventsPage() {
  const cookieStore = await cookies();

  const supabase = createClient(cookieStore);

  // Sort upcoming events first by their scheduled date.
  const { data: events, error } = await supabase
    .from("eventer")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error(
      "Error fetching events:",
      error
    );
  }

  return (
    <main className="min-h-full flex-1 bg-[#E2D9D0] px-6 py-10 text-[#331F2E] sm:py-14">
      <div className="mx-auto max-w-6xl">

        {/* Shared navigation link back to the admin dashboard. */}
        <AdminBackLink />

        {/* Page title and shortcut for creating an event. */}
        <div className="mb-8 mt-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A9533D]">Bokklubbens kalender</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-[#331F2E] sm:text-4xl">Arrangementer</h1>
            <p className="mt-2 text-[#5C3C54]">Opprett arrangementer, rediger detaljer og følg med på påmeldte.</p>
          </div>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#331F2E] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#5C3C54] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A9533D]"
          >
            <span aria-hidden="true">+</span> Opprett arrangement
          </Link>
        </div>

        {/* Main collection: EventList displays the empty state or event cards. */}
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-[#331F2E]">
            Alle arrangementer
          </h2>

          <EventList events={events ?? []} />
        </section>
      </div>
    </main>
  );
}

