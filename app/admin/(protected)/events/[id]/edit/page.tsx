import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/supabase/server";
import EventForm from "../../EventForm";
import type { Event } from "../../types";

type EditEventPageProps = {
  params: Promise<{ id: string }>;
};

// Server page: checks admin access, fetches one event, and seeds the shared form.
export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Keep edit access limited to the configured admin account.
  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  if (
    authError ||
    !authData?.claims ||
    authData.claims.sub !== process.env.ADMIN_USER_ID
  ) {
    redirect("/admin/login");
  }

  // Only fetch the fields needed by the edit form.
  const { data: event, error } = await supabase
    .from("eventer")
    .select("id, date, description, category, listOfParticipants")
    .eq("id", id)
    .maybeSingle();

  if (error || !event) {
    console.error("Could not fetch event:", error?.message);

    return (
      <main className="min-h-full flex-1 bg-[#E2D9D0] px-6 py-10 text-[#331F2E] sm:py-14">
        <div className="mx-auto max-w-3xl">
          {/* Explain the missing event and provide a way back to the list. */}
          <div className="mb-6">
            <Link
              href="/admin/events"
              className="text-sm font-semibold text-[#6A465E] underline decoration-[#C99B72] underline-offset-4 hover:text-[#A9533D]"
            >
              ← Tilbake til eventer
            </Link>
            <h1 className="mt-4 font-display text-3xl font-semibold text-[#331F2E]">Fant ikke eventet</h1>
            <p className="mt-2 text-[#5C3C54]">
              Eventet finnes ikke eller kunne ikke hentes.
            </p>
          </div>
          <Link
            href="/admin/events"
            className="inline-flex rounded-lg bg-[#331F2E] px-5 py-3 font-semibold text-white hover:bg-[#5C3C54]"
          >
            Tilbake til eventer
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full flex-1 bg-[#E2D9D0] px-6 py-10 text-[#331F2E] sm:py-14">
      <div className="mx-auto max-w-3xl">
        {/* Navigation and heading for the edit-event page. */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm font-semibold text-[#6A465E] underline decoration-[#C99B72] underline-offset-4 hover:text-[#A9533D]"
          >
            ← Tilbake til adminpanel
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A9533D]">Bokklubbens kalender</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#331F2E] sm:text-4xl">Rediger arrangement</h1>
          <p className="mt-2 text-[#5C3C54]">Endre tid, beskrivelse eller kategori.</p>
        </div>
        {/* Shared form prefilled with the event loaded above. */}
        <EventForm
          mode="edit"
          eventId={event.id}
          initialEvent={event as Event}
          cancelHref="/admin/events"
          successHref="/admin/events"
        />
      </div>
    </main>
  );
}
