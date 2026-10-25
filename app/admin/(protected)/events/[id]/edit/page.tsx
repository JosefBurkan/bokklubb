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
      <main className="min-h-screen bg-[var(--main)] px-6 py-10">
        <div className="mx-auto max-w-3xl">
          {/* Explain the missing event and provide a way back to the list. */}
          <div className="mb-6">
            <Link
              href="/admin/events"
              className="text-sm font-medium text-white/80 hover:text-white"
            >
              ← Tilbake til eventer
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-white">Fant ikke eventet</h1>
            <p className="mt-2 text-white/80">
              Eventet finnes ikke eller kunne ikke hentes.
            </p>
          </div>
          <Link
            href="/admin/events"
            className="inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-100"
          >
            Tilbake til eventer
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-3xl">
        {/* Navigation and heading for the edit-event page. */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm font-medium text-white/80 hover:text-white"
          >
            ← Tilbake til adminpanel
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">Rediger event</h1>
          <p className="mt-2 text-white/80">Endre informasjonen om dette eventet.</p>
        </div>
        {/* Shared form prefilled with the event loaded above. */}
        <EventForm
          mode="edit"
          eventId={event.id}
          initialEvent={event as Event}
          cancelHref="/admin"
          successHref="/admin"
        />
      </div>
    </main>
  );
}
