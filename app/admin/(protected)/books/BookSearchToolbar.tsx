"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type BookSearchToolbarProps = {
  search: string;
  sort: "name" | "created_at";
};

// Client controls for debounced title/description search and immediate sorting.
export default function BookSearchToolbar({ search, sort }: BookSearchToolbarProps) {
  const router = useRouter();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchValue, setSearchValue] = useState(search);
  const [sortValue, setSortValue] = useState(sort);

  useEffect(() => {
    // Clear any pending search when the toolbar is removed from the page.
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  function updateResults(query: string, selectedSort: "name" | "created_at") {
    const params = new URLSearchParams();
    const trimmedQuery = query.trim();

    if (trimmedQuery) params.set("q", trimmedQuery);
    params.set("sort", selectedSort);

    // Changing query parameters asks the server page for the matching result set.
    router.replace(`/admin/books?${params.toString()}`, { scroll: false });
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);

    if (searchTimer.current) clearTimeout(searchTimer.current);
    // Wait briefly between keystrokes to avoid sending a request per character.
    searchTimer.current = setTimeout(() => {
      updateResults(value, sortValue);
    }, 300);
  }

  function handleSortChange(value: "name" | "created_at") {
    setSortValue(value);

    if (searchTimer.current) clearTimeout(searchTimer.current);
    updateResults(searchValue, value);
  }

  return (
    <div className="mt-8 max-w-3xl">
      {/* Search field and sort selector for the collection below. */}
      <label htmlFor="book-search" className="mb-2 block font-semibold text-white">
        Søk etter bøker
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id="book-search"
          type="search"
          value={searchValue}
          onChange={(event) => handleSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              if (searchTimer.current) clearTimeout(searchTimer.current);
              updateResults(searchValue, sortValue);
            }
          }}
          placeholder="Søk på tittel eller beskrivelse"
          className="min-w-0 flex-1 basis-64 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
        />
        {/* Screen-reader label; the visible label is the select's option text. */}
        <label htmlFor="book-sort" className="sr-only">
          Sorter bøker
        </label>
        <select
          id="book-sort"
          value={sortValue}
          onChange={(event) =>
            handleSortChange(event.target.value as "name" | "created_at")
          }
          className="rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/20"
        >
          <option value="created_at">Dato registrert (nyeste først)</option>
          <option value="name">Tittel (A–Å)</option>
        </select>
        {/* Clear both the search and sort by returning to the default URL. */}
        {search && (
          <Link
            href="/admin/books"
            className="inline-flex items-center rounded-xl border border-white/40 px-4 py-3 font-semibold text-white hover:bg-white/10"
          >
            Nullstill
          </Link>
        )}
      </div>
    </div>
  );
}
