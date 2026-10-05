"use client";

import { FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

export default function NewEventPage() {
const router = useRouter();

const [date, setDate] = useState("");
const [description, setDescription] =
useState("");
const [category, setCategory] =
useState("Sosial");

const [loading, setLoading] =
useState(false);

const [error, setError] =
useState("");

const handleSubmit = async (
event: FormEvent<HTMLFormElement>
) => {
event.preventDefault();

setLoading(true);
setError("");

const response = await fetch(
  "/api/events",
  {
    method: "POST",
    headers: {
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify({
      date,
      description,
      category,
    }),
  }
);

const result = await response.json();

if (!response.ok) {
  setError(
    result.error ??
      "Kunne ikke opprette event."
  );

  setLoading(false);

  return;
}

router.push("/admin/events");
router.refresh();

};

return ( 
<main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900"> <div className="mx-auto max-w-3xl">
    <div className="mb-8">
      <button
        type="button"
        onClick={() =>
          router.push("/admin/events")
        }
        className="
          text-sm
          font-medium
          text-gray-600
          hover:text-gray-900
        "
      >
        ← Tilbake til eventer
      </button>

      <h1 className="mt-4 text-3xl font-bold">
        Opprett event
      </h1>

      <p className="mt-2 text-gray-600">
        Opprett et nytt event for bokklubben.
      </p>
    </div>

    <form
      onSubmit={handleSubmit}
      className="
        rounded-2xl
        bg-white
        p-6
        shadow-sm
      "
    >

      {/* Date */}
      <div className="mb-6">
        <label
          htmlFor="date"
          className="mb-2 block text-sm font-semibold"
        >
          Dato og tidspunkt
        </label>

        <input
          id="date"
          type="datetime-local"
          value={date}
          onChange={(event) =>
            setDate(event.target.value)
          }
          required
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            px-4
            py-3
            text-black
            outline-none
            focus:border-black
          "
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-semibold"
        >
          Beskrivelse
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          required
          rows={5}
          placeholder="Skriv en beskrivelse av eventet..."
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            px-4
            py-3
            text-black
            outline-none
            focus:border-black
          "
        />
      </div>

      {/* Category */}
      <div className="mb-6">
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-semibold"
        >
          Kategori
        </label>

        <select
          id="category"
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value
            )
          }
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            px-4
            py-3
            text-black
            outline-none
            focus:border-black
          "
        >
          <option value="Sosial">
            Sosial
          </option>

          <option value="Aktivitet">
            Aktivitet
          </option>

          <option value="Diskusjon">
            Diskusjon
          </option>

          <option value="Annet">
            Annet
          </option>
        </select>
      </div>

      {error && (
        <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/events"
            )
          }
          className="
            rounded-lg
            border
            border-gray-300
            px-5
            py-3
            font-medium
            text-gray-700
            hover:bg-gray-50
          "
        >
          Avbryt
        </button>

        <button
          type="submit"
          disabled={loading}
          className="
            rounded-lg
            bg-black
            px-5
            py-3
            font-semibold
            text-white
            hover:bg-gray-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? "Oppretter..."
            : "Opprett event"}
        </button>
      </div>

    </form>
  </div>
</main>

);
}
