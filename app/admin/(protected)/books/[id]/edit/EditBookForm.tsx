
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Book = {
  id: number;
  name: string | null;
  description: string | null;
  cloudinaryPath: string | null;
  active: boolean | null;
};

export default function EditBookForm({ book }: { book: Book }) {
  const router = useRouter();

  const [name, setName] = useState(book.name ?? "");
  const [description, setDescription] = useState(
    book.description ?? "",
  );
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    if (image) {
      formData.append("image", image);
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "PATCH",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Kunne ikke oppdatere boka.");
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
    <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/books" className="text-sm underline">
          ← Tilbake til bokadministrasjon
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Rediger bok</h1>
        <p className="mt-2 text-gray-600">
          Oppdater bokinformasjonen eller bytt omslagsbilde.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="name" className="mb-2 block font-semibold">
              Boktittel
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
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
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              maxLength={10000}
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <p className="mb-2 font-semibold">Nåværende omslagsbilde</p>

            {book.cloudinaryPath ? (
              <img
                src={book.cloudinaryPath}
                alt={book.name ?? "Bokomslag"}
                className="mb-4 max-h-64 w-40 rounded-lg object-contain"
              />
            ) : (
              <p className="mb-4 text-sm text-gray-500">
                Ingen omslagsbilde er registrert.
              </p>
            )}

            <label htmlFor="image" className="mb-2 block font-semibold">
              Bytt omslagsbilde (valgfritt)
            </label>
            <input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setImage(event.target.files?.[0] ?? null)
              }
              className="block w-full rounded-lg border border-gray-300 p-3"
            />
            <p className="mt-2 text-sm text-gray-500">
              JPG, PNG eller WebP. Maksimalt 5 MB.
              La feltet stå tomt for å beholde bildet.
            </p>

            {image && (
              <p className="mt-2 text-sm text-gray-600">
                Ny fil: {image.name}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[var(--header)] px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Lagrer..." : "Lagre endringer"}
            </button>

            <Link
              href="/admin/books"
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold"
            >
              Avbryt
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
