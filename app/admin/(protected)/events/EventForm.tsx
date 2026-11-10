"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
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

function getInitialDateParts(date?: string) {
  // Use local calendar values so editing preserves the club's Oslo wall time.
  if (!date) return { date: "", time: "" };

  const eventDate = new Date(date);
  const year = eventDate.getFullYear();
  const month = String(eventDate.getMonth() + 1).padStart(2, "0");
  const day = String(eventDate.getDate()).padStart(2, "0");
  const hour = String(eventDate.getHours()).padStart(2, "0");
  const minute = String(eventDate.getMinutes()).padStart(2, "0");

  return {
    date: formatDateDigits(`${day}${month}${year}`),
    time: `${hour}:${minute}`,
  };
}

// Format digit-only typing as DD.MM.YYYY while the user enters the date.
function formatDateDigits(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

// Format digit-only typing as HH:MM while the user enters the time.
function formatTimeDigits(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

// Find the caret position after the same number of digits in the formatted value.
function getMaskedCaretPosition(value: string, digitsBeforeCaret: number) {
  if (digitsBeforeCaret === 0) return 0;

  let digitsSeen = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) digitsSeen += 1;
    if (digitsSeen === digitsBeforeCaret) return index + 1;
  }

  return value.length;
}

// Keep day and month entries within their basic ranges while the user types.
function hasValidDatePrefix(digits: string) {
  if (digits.length >= 1 && Number(digits[0]) > 3) return false;
  if (digits.length >= 2) {
    const day = Number(digits.slice(0, 2));
    if (day < 1 || day > 31) return false;
  }

  if (digits.length < 3) return true;

  const firstMonthDigit = Number(digits[2]);
  if (firstMonthDigit > 1) return false;
  if (digits.length < 4) return true;

  const month = Number(digits.slice(2, 4));
  return month >= 1 && month <= 12;
}

// Keep hours within 00–23 and minutes within 00–59 as the user types.
function hasValidTimePrefix(digits: string) {
  if (digits.length >= 1 && Number(digits[0]) > 2) return false;
  if (digits.length >= 2 && Number(digits.slice(0, 2)) > 23) return false;
  if (digits.length >= 3 && Number(digits[2]) > 5) return false;
  if (digits.length >= 4 && Number(digits.slice(2, 4)) > 59) return false;

  return true;
}

// Keep typing in the correct place when formatting inserts a separator.
function updateMaskedInput(
  event: ChangeEvent<HTMLInputElement>,
  formatter: (value: string) => string,
  setValue: (value: string) => void,
  previousValue: string,
  validateDigits?: (digits: string) => boolean,
) {
  const input = event.currentTarget;
  const cursor = input.selectionStart ?? input.value.length;
  const digits = input.value.replace(/\D/g, "");
  if (validateDigits && !validateDigits(digits)) {
    setValue(previousValue);
    requestAnimationFrame(() => {
      const caret = Math.min(cursor, previousValue.length);
      input.setSelectionRange(caret, caret);
    });
    return;
  }

  const digitsBeforeCaret = input.value.slice(0, cursor).replace(/\D/g, "").length;
  const formattedValue = formatter(input.value);

  setValue(formattedValue);
  requestAnimationFrame(() => {
    const caret = getMaskedCaretPosition(formattedValue, digitsBeforeCaret);
    input.setSelectionRange(caret, caret);
  });
}

// Accept Norwegian day.month.year input, as well as an ISO date if pasted.
function parseEventDate(value: string) {
  const input = value.trim();
  const norwegianDate = input.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  const isoDate = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const year = Number(norwegianDate?.[3] ?? isoDate?.[1]);
  const month = Number(norwegianDate?.[2] ?? isoDate?.[2]);
  const day = Number(norwegianDate?.[1] ?? isoDate?.[3]);

  if (!norwegianDate && !isoDate) return null;

  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Accept 18:30, 18.30, or 1830 and normalize the value for the API.
function parseEventTime(value: string) {
  const input = value.trim();
  const clockTime = input.match(/^(\d{1,2})[:.]([0-5]\d)$/);
  const compactTime = input.match(/^(\d{2})([0-5]\d)$/);
  const hour = Number(clockTime?.[1] ?? compactTime?.[1]);
  const minute = Number(clockTime?.[2] ?? compactTime?.[2]);

  if ((!clockTime && !compactTime) || hour > 23) return null;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// Convert a chosen native calendar date to the visible DD.MM.YYYY format.
function formatIsoDateForInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? formatDateDigits(`${match[3]}${match[2]}${match[1]}`) : "";
}

export default function EventForm({
  mode,
  eventId,
  initialEvent,
  cancelHref,
  successHref,
}: EventFormProps) {
  const router = useRouter();
  const initialDate = getInitialDateParts(initialEvent?.date);
  const [date, setDate] = useState(initialDate.date);
  const [time, setTime] = useState(initialDate.time);
  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [description, setDescription] = useState(initialEvent?.description ?? "");
  const [category, setCategory] = useState(initialEvent?.category ?? "Sosial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Skriv inn en tittel på arrangementet.");
      return;
    }

    const parsedDate = parseEventDate(date);
    if (!parsedDate) {
      setError("Skriv inn en gyldig dato som DD.MM.ÅÅÅÅ, for eksempel 24.06.2027.");
      return;
    }

    const parsedTime = parseEventTime(time);
    if (!parsedTime) {
      setError("Skriv inn et gyldig klokkeslett som TT:MM, for eksempel 18:30.");
      return;
    }

    setLoading(true);

    try {
      const localDateTime = `${parsedDate}T${parsedTime}`;

      // Use the collection endpoint for creation and the event-specific endpoint for edits.
      const response = await fetch(
        mode === "create" ? "/api/events" : `/api/events/${eventId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Both create and edit store the Oslo wall time consistently.
            date: localDateTime,
            title: title.trim(),
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
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-6 shadow-[0_4px_16px_rgba(51,31,46,0.06)] sm:p-8">
      {/* Text fields accept direct typing and retain native pickers on the right. */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event-date" className="mb-2 block text-sm font-semibold">
            Dato <span className="font-normal text-[#5D4B57]">(DD.MM.ÅÅÅÅ)</span>
          </label>
          <div className="relative">
            <input
              id="event-date"
              type="text"
              inputMode="numeric"
              value={date}
              onChange={(event) => updateMaskedInput(event, formatDateDigits, setDate, date, hasValidDatePrefix)}
              required
              maxLength={10}
              placeholder="DD.MM.ÅÅÅÅ"
              autoComplete="off"
              aria-describedby="event-date-help"
              className="w-full rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-3 pr-12 text-[#331F2E] placeholder:text-[#75636F] outline-none focus:border-[#A9533D] focus:ring-2 focus:ring-[#A9533D]/20"
            />
            <input
              type="date"
              aria-label="Velg dato fra kalenderen"
              value={parseEventDate(date) ?? ""}
              onChange={(event) => setDate(formatIsoDateForInput(event.target.value))}
              className="peer absolute right-0 top-0 z-10 h-full w-12 cursor-pointer opacity-0"
            />
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute right-3 top-1/2 z-20 size-5 -translate-y-1/2 text-[#594653] peer-focus-visible:text-[#A9533D]">
              <rect x="3.5" y="5" width="17" height="16" rx="2" />
              <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17" />
            </svg>
          </div>
          <p id="event-date-help" className="sr-only">Dag må være 01–31, og måned 01–12.</p>
        </div>
        <div>
          <label htmlFor="event-time" className="mb-2 block text-sm font-semibold">
            Klokkeslett (Oslo)
          </label>
          <div className="relative">
            <input
              id="event-time"
              type="text"
              inputMode="numeric"
              value={time}
              onChange={(event) => updateMaskedInput(event, formatTimeDigits, setTime, time, hasValidTimePrefix)}
              required
              maxLength={5}
              placeholder="00:00"
              autoComplete="off"
              aria-describedby="event-time-help"
              className="w-full rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-3 pr-12 text-[#331F2E] placeholder:text-[#75636F] outline-none focus:border-[#A9533D] focus:ring-2 focus:ring-[#A9533D]/20"
            />
            <input
              type="time"
              aria-label="Velg klokkeslett"
              value={parseEventTime(time) ?? ""}
              onChange={(event) => setTime(formatTimeDigits(event.target.value))}
              className="peer absolute right-0 top-0 z-10 h-full w-12 cursor-pointer opacity-0"
            />
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute right-3 top-1/2 z-20 size-5 -translate-y-1/2 text-[#594653] peer-focus-visible:text-[#A9533D]">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>
          <p id="event-time-help" className="sr-only">Timer må være 00–23, og minutter 00–59.</p>
        </div>
      </div>

      {/* The short title is shown as the event heading throughout the site. */}
      <div className="mb-6">
        <label htmlFor="event-title" className="mb-2 block text-sm font-semibold">
          Tittel
        </label>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={200}
          placeholder="Skriv inn arrangementets tittel"
          className="w-full rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-3 text-[#331F2E] placeholder:text-[#75636F] outline-none focus:border-[#A9533D] focus:ring-2 focus:ring-[#A9533D]/20"
        />
      </div>

      {/* Longer event information is stored separately from the title. */}
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
          className="w-full rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-3 text-[#331F2E] placeholder:text-[#75636F] outline-none focus:border-[#A9533D] focus:ring-2 focus:ring-[#A9533D]/20"
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
          className="w-full rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-3 text-[#331F2E] outline-none focus:border-[#A9533D] focus:ring-2 focus:ring-[#A9533D]/20"
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
          className="rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-5 py-3 font-semibold text-[#331F2E] hover:bg-[#F0E7DE]"
        >
          Avbryt
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#331F2E] px-5 py-3 font-semibold text-white hover:bg-[#5C3C54] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Lagrer..."
            : mode === "create"
              ? "Opprett arrangement"
              : "Lagre endringer"}
        </button>
      </div>
    </form>
  );
}
