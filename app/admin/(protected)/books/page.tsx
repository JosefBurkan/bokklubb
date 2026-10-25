
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import BookSearch from "./BookSearch";

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

        <BookSearch books={books ?? []} months={months} />
      </div>
    </main>
  );
}
