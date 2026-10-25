import Link from "next/link";

import EventForm from "../EventForm";

// Page wrapper for creating an event; the shared form handles the submission.
export default function NewEventPage() {
  return (
    <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-3xl">
        {/* Navigation and heading for the create-event page. */}
        <div className="mb-8">
          <Link
            href="/admin/events"
            className="text-sm font-medium text-white/80 hover:text-white"
          >
            ← Tilbake til eventer
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">Opprett event</h1>
          <p className="mt-2 text-white/80">Opprett et nytt event for bokklubben.</p>
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
