"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Book = {
  id: number;
  name: string;
  description: string;
  cloudinaryPath: string | null;
  active: boolean;
  created_at: string;
};

type BookSearchProps = {
  books: Book[];
  months: string[];
};

export default function BookSearch({ books, months }: BookSearchProps) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("no-NO");

  const filteredBooks = useMemo(() => {
    if (!normalizedSearch) return books;

    return books.filter((book) =>
      `${book.name} ${book.description}`
        .toLocaleLowerCase("no-NO")
        .includes(normalizedSearch),
    );
  }, [books, normalizedSearch]);

  const currentBook = filteredBooks.find((book) => book.active);
  const archivedBooks = filteredBooks.filter((book) => !book.active);
  const hasBooks = books.length > 0;
  const hasMatches = filteredBooks.length > 0;

  function getMonth(createdAt: string) {
    return months[new Date(createdAt).getMonth()];
  }

  return (
    <>
      <div className="mt-8 max-w-xl">
        <label htmlFor="book-search" className="mb-2 block font-semibold">
          Søk etter bøker
        </label>
        <input
          id="book-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Søk på tittel eller beskrivelse"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
        />
        {search && (
          <p className="mt-2 text-sm text-gray-600" aria-live="polite">
            {filteredBooks.length} av {books.length} bøker
          </p>
        )}
      </div>

      {!hasBooks ? (
        <p className="mt-8 rounded-2xl bg-white p-6">
          Det finnes ingen bøker ennå.
        </p>
      ) : !hasMatches ? (
        <p className="mt-8 rounded-2xl bg-white p-6" role="status">
          Ingen bøker samsvarer med «{search}».
        </p>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-bold">Nåværende bok</h2>

            {currentBook ? (
              <div className="flex flex-col gap-5 rounded-2xl bg-white p-6 sm:flex-row">
                {currentBook.cloudinaryPath && (
                  <img
                    src={currentBook.cloudinaryPath}
                    alt={currentBook.name}
                    className="w-40 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold">{currentBook.name}</h3>
                  <p className="mt-2 text-gray-600">{currentBook.description}</p>
                  <p className="mt-3 text-sm text-gray-500">
                    Registrert i {getMonth(currentBook.created_at)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-green-700">
                    Aktiv bok
                  </p>
                  <Link
                    href={`/admin/books/${currentBook.id}/edit`}
                    className="mt-4 inline-block rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
                  >
                    Rediger bok
                  </Link>
                </div>
              </div>
            ) : (
              <p className="rounded-2xl bg-white p-6">
                {search
                  ? "Ingen aktiv bok samsvarer med søket."
                  : "Ingen aktiv bok er valgt."}
              </p>
            )}
          </section>

          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold">Tidligere bøker</h2>

            {archivedBooks.length === 0 ? (
              <p className="rounded-2xl bg-white p-6">
                {search
                  ? "Ingen tidligere bøker samsvarer med søket."
                  : "Det finnes ingen tidligere bøker ennå."}
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {archivedBooks.map((book) => (
                  <article
                    key={book.id}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                  >
                    {book.cloudinaryPath && (
                      <img
                        src={book.cloudinaryPath}
                        alt={book.name}
                        className="mb-4 max-h-56 w-full rounded-lg object-contain"
                      />
                    )}
                    <h3 className="font-bold">{book.name}</h3>
                    <p className="mt-2 text-gray-600">{book.description}</p>
                    <p className="mt-3 text-sm text-gray-500">
                      {getMonth(book.created_at)}
                    </p>
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      className="mt-4 inline-block rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
                    >
                      Rediger bok
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
