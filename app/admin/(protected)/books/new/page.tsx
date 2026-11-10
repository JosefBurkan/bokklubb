
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Client page for uploading a new book and its cover image.
export default function BookForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (!image) {
      setError("Velg et omslagsbilde.");
      return;
    }

    // FormData is used because the request includes an image file upload.
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image);

    setLoading(true);

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Kunne ikke lagre boka.");
        return;
      }

      router.push("/admin/books");
      router.refresh();
    } catch {
      setError("Kunne ikke kontakte serveren. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-full flex-1 bg-[#E2D9D0] px-6 py-10 text-[#331F2E] sm:py-14">
      <div className="mx-auto max-w-3xl">
        {/* Back link and page title. */}
        <Link href="/admin/books" className="text-sm font-semibold text-[#6A465E] underline decoration-[#C99B72] underline-offset-4 hover:text-[#A9533D]">
          ← Tilbake til bokadministrasjon
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-[#A9533D]">Boksamlingen</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#331F2E] sm:text-4xl">
          Legg til en bok
        </h1>
        <p className="mt-2 text-[#5C3C54]">
          Legg inn informasjon og omslagsbilde for en ny bok.
        </p>

        {/* New book fields and cover image upload. */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-6 shadow-[0_4px_16px_rgba(51,31,46,0.06)] sm:p-8"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block font-semibold"
            >
              Boktittel
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={200}
              className="w-full rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-3 text-[#331F2E] placeholder:text-[#75636F] outline-none focus:border-[#A9533D] focus:ring-2 focus:ring-[#A9533D]/20"
              placeholder="Skriv inn boktittelen"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block font-semibold"
            >
              Beskrivelse
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              maxLength={10000}
              rows={5}
              className="w-full rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-3 text-[#331F2E] placeholder:text-[#75636F] outline-none focus:border-[#A9533D] focus:ring-2 focus:ring-[#A9533D]/20"
              placeholder="Skriv en kort beskrivelse av boka"
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="mb-2 block font-semibold"
            >
              Omslagsbilde
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(event) =>
                setImage(event.target.files?.[0] ?? null)
              }
              className="block w-full rounded-lg border border-[#B8A8A0] bg-[#FFFCF7] p-3 text-[#331F2E]"
            />
            <p className="mt-2 text-sm text-[#5D4B57]">
              JPG, PNG eller WebP. Maksimalt 5 MB.
            </p>

            {image && (
              <p className="mt-2 text-sm text-[#594653]">
                Valgt fil: {image.name}
              </p>
            )}
          </div>

          {error && (
            /* Display validation or API errors above the form actions. */
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Save the book or return to the collection without saving. */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#331F2E] px-5 py-3 font-semibold text-white transition hover:bg-[#5C3C54] disabled:opacity-50"
            >
              {loading ? "Lagrer..." : "Lagre bok"}
            </button>

            <Link
              href="/admin/books"
              className="rounded-xl border border-[#B8A8A0] bg-[#FFFCF7] px-5 py-3 font-semibold text-[#331F2E] hover:bg-[#F0E7DE]"
            >
              Avbryt
            </Link>
          </div>

          {/* New books are initially archived; activation is a separate action. */}
          <p className="text-sm text-[#5D4B57]">
            Den nye boka lagres som arkivert. Du kan aktivere den
            som månedens bok etterpå.
          </p>
        </form>
      </div>
    </main>
  );
}
