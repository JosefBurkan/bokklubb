"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { Event } from "./types";

const EVENT_CATEGORIES = ["Sosial", "Aktivitet", "Diskusjon", "Annet"];

// The form can create a new event or edit an existing one, depending on mode.
type EventFormProps = {
  mode: "create" | "edit";
  eventId?: number;
  initialEvent?: Event;
  cancelHref: string;
  successHref: string;
};

function getInitialDate(date?: string) {
  // datetime-local inputs expect a local date string without the timezone suffix.
  return date ? new Date(date).toISOString().slice(0, 16) : "";
}

export default function EventForm({
  mode,
  eventId,
  initialEvent,
  cancelHref,
  successHref,
}: EventFormProps) {
  const router = useRouter();
  const [date, setDate] = useState(getInitialDate(initialEvent?.date));
  const [description, setDescription] = useState(initialEvent?.description ?? "");
  const [category, setCategory] = useState(initialEvent?.category ?? "Sosial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use the collection endpoint for creation and the event-specific endpoint for edits.
      const response = await fetch(
        mode === "create" ? "/api/events" : `/api/events/${eventId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: mode === "edit" ? new Date(date).toISOString() : date,
            description: description.trim(),
            category,
          }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Kunne ikke lagre eventet.");
        return;
      }

      // Return to the relevant admin page after a successful save.
      router.push(successHref);
      router.refresh();
    } catch {
      setError("Kunne ikke kontakte serveren. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
      {/* Event date and start time. */}
      <div className="mb-6">
        <label htmlFor="event-date" className="mb-2 block text-sm font-semibold">
          Dato og tidspunkt
        </label>
        <input
          id="event-date"
          type="datetime-local"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black"
        />
      </div>

      {/* Text shown as the event's title/details. */}
      <div className="mb-6">
        <label htmlFor="event-description" className="mb-2 block text-sm font-semibold">
          Beskrivelse
        </label>
        <textarea
          id="event-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          rows={5}
          placeholder="Skriv en beskrivelse av eventet..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-black"
        />
      </div>

      {/* Category selector, using the options defined above. */}
      <div className="mb-6">
        <label htmlFor="event-category" className="mb-2 block text-sm font-semibold">
          Kategori
        </label>
        <select
          id="event-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-black"
        >
          {EVENT_CATEGORIES.map((eventCategory) => (
            <option key={eventCategory} value={eventCategory}>
              {eventCategory}
            </option>
          ))}
        </select>
      </div>

      {/* Show server or network errors without leaving the form. */}
      {error && (
        <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Cancel returns to the supplied page; submit creates or saves the event. */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push(cancelHref)}
          className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          Avbryt
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Lagrer..."
            : mode === "create"
              ? "Opprett event"
              : "Lagre endringer"}
        </button>
      </div>
    </form>
  );
}
