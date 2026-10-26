
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import AdminBackLink from "../AdminBackLink";
import BookSearch from "./BookSearch";

const PAGE_SIZE = 25;

type AdminBooksPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
  }>;
};

const months = [
  "Januar", "Februar", "Mars", "April",
  "Mai", "Juni", "Juli", "August",
  "September", "Oktober", "November", "Desember",
];

// Server page: reads search/sort/page from the URL and queries Supabase.
export default async function AdminBooksPage({
  searchParams,
}: AdminBooksPageProps) {
  const params = await searchParams;
  // Remove PostgREST filter delimiters so a search value stays plain text.
  const search = (params.q ?? "")
    .replace(/[(),."\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  const sort = params.sort === "name" ? "name" : "created_at";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, 1_000_000)
    : 1;
  const firstRow = (page - 1) * PAGE_SIZE;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch the active book separately so it remains pinned above search results.
  const currentBookQuery = supabase
    .from("Books")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // The lower table contains the whole collection. Search filters both active
  // and archived books, while the active book is also pinned above.
  let booksQuery = supabase
    .from("Books")
    .select("*", { count: "exact" })
    .order(sort, { ascending: sort === "name" })
    .order("id", { ascending: true });

  if (search) {
    booksQuery = booksQuery.or(
      `name.ilike.%${search}%,description.ilike.%${search}%`,
    );
  }

  const [
    { data: currentBook, error: currentBookError },
    { data: books, error, count },
  ] = await Promise.all([
    currentBookQuery,
    booksQuery.range(firstRow, firstRow + PAGE_SIZE - 1),
  ]);

  if (error || currentBookError) {
    console.error(
      "Kunne ikke hente bøker:",
      error?.message ?? currentBookError?.message,
    );

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

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  if (page > totalPages) {
    const redirectParams = new URLSearchParams();
    if (search) redirectParams.set("q", search);
    if (sort !== "created_at") redirectParams.set("sort", sort);
    redirectParams.set("page", String(totalPages));
    redirect(`/admin/books?${redirectParams.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl">
        {/* Shared navigation link back to the admin dashboard. */}
        <AdminBackLink />

        {/* Page heading and shortcut to add a new book. */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Administrer månedens bok
            </h1>
            <p className="mt-2 text-white/80">
              Administrer månedens bok og arkivet. Søk og bla gjennom 25 bøker om gangen.
            </p>
          </div>

          <Link
            href="/admin/books/new"
            className="rounded-xl bg-white px-5 py-3 font-semibold shadow-sm hover:shadow-md"
          >
            + Legg til bok
          </Link>
        </div>

        {/* Receives server-fetched data and renders the interactive collection UI. */}
        <BookSearch
          books={books ?? []}
          currentBook={currentBook ?? null}
          search={search}
          sort={sort}
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={count ?? 0}
          months={months}
        />
      </div>
    </main>
  );
}
