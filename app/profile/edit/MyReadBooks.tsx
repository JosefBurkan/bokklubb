"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type EditableBook = {
  id: number;
  name: string;
  author: string | null;
  cloudinaryPath: string | null;
};

export default function MyReadBooks({ books }: { books: EditableBook[] }) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function removeBook(book: EditableBook) {
    if (!window.confirm(`Fjerne «${book.name}» fra leselisten din?`)) return;

    setRemovingId(book.id);
    setMessage("");
    try {
      const response = await fetch("/api/community/books", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage(`«${book.name}» er fjernet fra leselisten.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kunne ikke fjerne boka.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-5 shadow-[0_4px_16px_rgba(51,31,46,0.06)] sm:p-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A9533D]">Bokhyllen din</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-[#331F2E]">Bøker lagt til som lest</h2>
        <p className="mt-1 text-sm text-[#594653]">Du kan fjerne bøker du la til ved en feil.</p>
      </div>

      {books.length ? (
        <ul className="mt-5 divide-y divide-[#E1D6CC]">
          {books.map((book) => (
            <li key={book.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0 sm:flex-nowrap">
              {book.cloudinaryPath ? (
                <img src={book.cloudinaryPath} alt="" className="h-16 w-11 shrink-0 rounded-md object-cover" />
              ) : (
                <div aria-hidden="true" className="flex h-16 w-11 shrink-0 items-center justify-center rounded-md bg-[#E8D9E4] font-display text-lg font-semibold text-[#553D68]">
                  {book.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#331F2E]">{book.name}</p>
                {book.author && <p className="mt-1 text-sm text-[#594653]">{book.author}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeBook(book)}
                disabled={removingId !== null}
                className="ml-auto rounded-lg border border-[#B86A62] px-3 py-2 text-sm font-semibold text-[#8C3630] transition hover:bg-[#F6E5E1] disabled:cursor-wait disabled:opacity-60"
              >
                {removingId === book.id ? "Fjerner…" : "Fjern"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-[#D0C1B5] p-5 text-sm text-[#594653]">
          Ingen bøker lagt til ennå. Du kan legge til bøker fra Community.
        </div>
      )}

      {message && <p role="status" className="mt-4 text-sm text-[#5C3C54]">{message}</p>}
    </section>
  );
}
