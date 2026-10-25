import Link from "next/link";

import BookStatusButton from "./BookStatusButton";
import BookSearchToolbar from "./BookSearchToolbar";
import DeleteBookButton from "./DeleteBookButton";

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
  currentBook: Book | null;
  search: string;
  sort: "name" | "created_at";
  page: number;
  pageSize: number;
  totalCount: number;
  months: string[];
};

// Converts the database timestamp to the Norwegian month label shown in the table.
function getMonth(createdAt: string, months: string[]) {
  return months[new Date(createdAt).getMonth()];
}

// Keeps the current search and sort when the admin moves between result pages.
function pageHref(search: string, sort: "name" | "created_at", page: number) {
  const params = new URLSearchParams();

  if (search) params.set("q", search);
  params.set("sort", sort);
  params.set("page", String(page));

  return `/admin/books?${params.toString()}`;
}

// Renders the pinned monthly book, search controls, and paginated collection.
export default function BookSearch({
  books,
  currentBook,
  search,
  sort,
  page,
  pageSize,
  totalCount,
  months,
}: BookSearchProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const firstResult = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastResult = Math.min(page * pageSize, totalCount);

  return (
    <>
      {/* The active book stays visible even when the collection is filtered. */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-white">Nåværende bok</h2>

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
                Registrert i {getMonth(currentBook.created_at, months)}
              </p>
              <p className="mt-2 text-sm font-semibold text-green-700">
                Aktiv bok
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/admin/books/${currentBook.id}/edit`}
                  className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
                >
                  Rediger bok
                </Link>
                <BookStatusButton bookId={currentBook.id} active />
                <DeleteBookButton
                  bookId={currentBook.id}
                  bookName={currentBook.name}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl bg-white p-6">Ingen aktiv bok er valgt.</p>
        )}
      </section>

      {/* Search and sort controls update the URL, which reloads the server results. */}
      <BookSearchToolbar key={`${search}:${sort}`} search={search} sort={sort} />

      {/* Filtered collection table, result count, and pagination. */}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">Bøker i samlingen</h2>
            {search && (
              <p className="mt-1 text-sm text-white/80">
                Søker etter «{search}»
              </p>
            )}
          </div>
          <p className="text-sm text-white/80" aria-live="polite">
            {firstResult}–{lastResult} av {totalCount} bøker
          </p>
        </div>

        {books.length === 0 ? (
          /* Show a search-specific message or the empty collection message. */
          <p className="rounded-2xl bg-white p-6" role="status">
            {search
              ? `Ingen bøker samsvarer med «${search}».`
              : "Det finnes ingen bøker ennå."}
          </p>
        ) : (
          /* Each table row shows one book and its available admin actions. */
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-600">
                  <th scope="col" className="px-5 py-4 font-semibold">Bok</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Registrert</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Handlinger</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex min-w-64 items-center gap-3">
                        {book.cloudinaryPath ? (
                          <img
                            src={book.cloudinaryPath}
                            alt=""
                            className="h-14 w-10 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <div className="h-14 w-10 shrink-0 rounded bg-gray-100" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{book.name}</p>
                          <p className="mt-1 line-clamp-2 max-w-xl text-sm text-gray-600">
                            {book.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      {getMonth(book.created_at, months)}
                    </td>
                    <td className="px-5 py-4">
                      {book.active ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                          Månedens bok
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Arkivert</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/books/${book.id}/edit`}
                          className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                        >
                          Rediger bok
                        </Link>
                        {book.active ? (
                          <BookStatusButton bookId={book.id} active />
                        ) : (
                          <BookStatusButton bookId={book.id} active={false} />
                        )}
                        <DeleteBookButton
                          bookId={book.id}
                          bookName={book.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          /* Only show paging controls when the collection has multiple pages. */
          <nav
            aria-label="Sidenavigasjon for bøker"
            className="mt-5 flex items-center justify-between gap-4"
          >
            {page > 1 ? (
              <Link
                href={pageHref(search, sort, page - 1)}
                className="rounded-lg bg-white px-4 py-2 font-semibold text-[#340949] hover:bg-gray-100"
              >
                ← Forrige
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm text-white/90">
              Side {page} av {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={pageHref(search, sort, page + 1)}
                className="rounded-lg bg-white px-4 py-2 font-semibold text-[#340949] hover:bg-gray-100"
              >
                Neste →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </>
  );
}
