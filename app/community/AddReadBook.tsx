"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type BookOption = { id: number; name: string; author: string | null };

// Lets a signed-in member search for a book and add it to their read shelf.
export default function AddReadBook({ existingBookIds }: { existingBookIds: number[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookOption[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Wait briefly for typing to pause before searching the book collection.
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/community/books?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setResults(data);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage("Kunne ikke søke etter bøker. Prøv igjen.");
        setIsError(true);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  async function addBook(book: BookOption) {
    setLoadingId(book.id);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/community/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(`${book.name} er lagt til på profilen din.`);
      setQuery("");
      setResults([]);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kunne ikke legge til boka.");
      setIsError(true);
    } finally {
      setLoadingId(null);
    }
  }

  const availableResults = results.filter((book) => !existingBookIds.includes(book.id));

  return (
    <section className="rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-5 shadow-[0_4px_16px_rgba(51,31,46,0.06)] sm:p-6">
      <h2 className="font-display text-xl font-semibold text-[#331F2E]">Legg til en bok du har lest</h2>
      <p className="mt-1 text-sm text-[#594653]">Søk i bokklubbens samling. Du trenger ikke skrive en anmeldelse.</p>
      <label htmlFor="community-book-search" className="sr-only">Søk etter bok</label>
      <input
        id="community-book-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Søk etter boktittel eller forfatter…"
        className="mt-4 w-full rounded-xl border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-3 text-[#331F2E] outline-none placeholder:text-[#75636F] focus:border-[#A9533D] focus:ring-2 focus:ring-[#A9533D]/20"
      />

      {query.trim().length >= 2 && (
        <ul className="mt-2 divide-y divide-[#E1D6CC] overflow-hidden rounded-xl border border-[#D0C1B5] bg-[#FFFCF7]">
          {availableResults.length ? availableResults.map((book) => (
            <li key={book.id} className="flex items-center justify-between gap-4 p-3">
              <span className="min-w-0">
                <span className="block font-semibold text-[#331F2E]">{book.name}</span>
                {book.author && <span className="block text-sm text-[#5D4B57]">{book.author}</span>}
              </span>
              <button
                type="button"
                onClick={() => addBook(book)}
                disabled={loadingId !== null}
                className="shrink-0 rounded-lg bg-[#331F2E] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5C3C54] disabled:opacity-60"
              >
                {loadingId === book.id ? "Legger til…" : "Legg til"}
              </button>
            </li>
          )) : (
            <li className="p-3 text-sm text-[#594653]">
              {results.length ? "Alle treffene er allerede på profilen din." : "Ingen bøker funnet. Skriv minst to tegn."}
            </li>
          )}
        </ul>
      )}

      {message && <p role="status" className={`mt-3 text-sm ${isError ? "text-red-700" : "text-green-800"}`}>{message}</p>}
    </section>
  );
}
