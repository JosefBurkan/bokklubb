
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

const months = [
  "Januar", "Februar", "Mars", "April",
  "Mai", "Juni", "Juli", "August",
  "September", "Oktober", "November", "Desember",
];

export default async function AdminBooksPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: books, error } = await supabase
    .from("Books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Kunne ikke hente bøker:", error.message);

    return (
      <main className="min-h-screen bg-[var(--main)] px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6">
          <h1 className="text-2xl font-bold">
            Administrer månedens bok
          </h1>
          <p className="mt-4 text-red-600">
            Kunne ikke hente bøkene fra databasen.
            Sjekk Supabase-tilkoblingen og RLS-policyene.
          </p>
          <Link className="mt-4 inline-block underline" href="/admin">
            Tilbake til adminpanelet
          </Link>
        </div>
      </main>
    );
  }

  const currentBook = (books ?? []).find((book) => book.active);
  const archivedBooks = (books ?? []).filter((book) => !book.active);

  function getMonth(createdAt: string) {
    return months[new Date(createdAt).getMonth()];
  }

  return (
    <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm underline">
          ← Tilbake til adminpanelet
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Administrer månedens bok
            </h1>
            <p className="mt-2 text-gray-600">
              Administrer den aktive boka og tidligere bøker.
            </p>
          </div>

          <Link
            href="/admin/books/new"
            className="rounded-xl bg-white px-5 py-3 font-semibold shadow-sm hover:shadow-md"
          >
            + Legg til bok
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold">
            Nåværende bok
          </h2>

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
                <h3 className="text-lg font-bold">
                  {currentBook.name}
                </h3>
                <p className="mt-2 text-gray-600">
                  {currentBook.description}
                </p>
                <p className="mt-3 text-sm text-gray-500">
                  Registrert i {getMonth(currentBook.created_at)}
                </p>
                <p className="mt-2 text-sm font-semibold text-green-700">
                  Aktiv bok
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-6">
              Ingen aktiv bok er valgt.
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold">
            Tidligere bøker
          </h2>

          {archivedBooks.length === 0 ? (
            <div className="rounded-2xl bg-white p-6">
              Det finnes ingen tidligere bøker ennå.
            </div>
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
                  <p className="mt-2 text-gray-600">
                    {book.description}
                  </p>
                  <p className="mt-3 text-sm text-gray-500">
                    {getMonth(book.created_at)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
