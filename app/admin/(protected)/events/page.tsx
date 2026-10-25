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
    <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl">

        {/* Shared navigation link back to the admin dashboard. */}
        <AdminBackLink />

        {/* Page title and shortcut for creating an event. */}
        <div className="mt-6 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Administrer eventer</h1>
            <p className="mt-2 text-white/80">Opprett, rediger og slett eventer.</p>
          </div>
          <Link
            href="/admin/events/new"
            className="rounded-xl bg-white px-5 py-3 font-semibold shadow-sm hover:shadow-md"
          >
            + Opprett event
          </Link>
        </div>

        {/* Main collection: EventList displays the empty state or event cards. */}
        <section>
          <h2 className="mb-5 text-xl font-semibold text-white">
            Eventer
          </h2>

          <EventList events={events ?? []} />
        </section>
      </div>
    </main>
  );
}

