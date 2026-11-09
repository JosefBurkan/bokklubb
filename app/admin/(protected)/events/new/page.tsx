import Link from "next/link";

import EventForm from "../EventForm";

// Page wrapper for creating an event; the shared form handles the submission.
export default function NewEventPage() {
  return (
    <main className="min-h-full flex-1 bg-[#E7DCE8] px-6 py-10 text-[#331F2E] sm:py-14">
      <div className="mx-auto max-w-3xl">
        {/* Navigation and heading for the create-event page. */}
        <div className="mb-8">
          <Link
            href="/admin/events"
            className="text-sm font-semibold text-[#6A465E] underline decoration-[#C99B72] underline-offset-4 hover:text-[#A9533D]"
          >
            ← Tilbake til eventer
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A9533D]">Bokklubbens kalender</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#331F2E] sm:text-4xl">Opprett arrangement</h1>
          <p className="mt-2 text-[#5C3C54]">Legg inn tid, beskrivelse og kategori.</p>
        </div>
        {/* Shared form configured to create a new event. */}
        <EventForm
          mode="create"
          cancelHref="/admin/events"
          successHref="/admin/events"
        />
      </div>
    </main>
  );
}
