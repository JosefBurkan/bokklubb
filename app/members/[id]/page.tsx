import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import DisplaySpiceRating from "@/app/components/Reviews/DisplaySpiceRating";
import DisplayStarRating from "@/app/components/Reviews/DisplayStarRating";

type ProfileBook = { book_id: number };
type Book = {
  id: number;
  name: string;
  author: string | null;
  cloudinaryPath: string | null;
};

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [userResult, profileResult, shelfResult, reviewsResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("profiles")
      .select("id, display_name, bio, avatar_url")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("profile_books")
      .select("book_id")
      .eq("profile_id", id),
    supabase
      .from("book_reviews")
      .select("id, book_id, review, rating, spice, Books(name, author)")
      .eq("user_id", id)
      .not("review", "is", null),
  ]);

  if (!profileResult.data) notFound();

  const bookIds = [...new Set([
    ...(shelfResult.data ?? []).map((entry: ProfileBook) => entry.book_id),
    ...(reviewsResult.data ?? []).map((review) => review.book_id),
  ])];
  const booksResult = bookIds.length
    ? await supabase
        .from("Books")
        .select("id, name, author, cloudinaryPath")
        .in("id", bookIds)
        .order("name")
    : { data: [] as Book[], error: null };
  const readBooks = (booksResult.data ?? []) as Book[];
  const hasError = shelfResult.error || reviewsResult.error || booksResult.error;
  const displayName = profileResult.data.display_name || "Bokklubbmedlem";
  const isOwnProfile = userResult.data.user?.id === profileResult.data.id;

  return (
    <main className="min-h-screen bg-[#E2D9D0] px-5 py-10 text-[#331F2E] sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <Link href="/community" className="text-sm font-medium text-[#5C3C54] underline underline-offset-4 hover:text-[#A9533D]">
          ← Tilbake til Community
        </Link>

        <header className="mt-7 rounded-3xl bg-[#493346] p-7 text-[#FFF9F0] sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F3C66E]">Medlemsprofil</p>
              <div className="mt-4 flex items-center gap-4">
                {profileResult.data.avatar_url ? (
                  <img src={profileResult.data.avatar_url} alt="" className="size-16 shrink-0 rounded-full object-cover ring-2 ring-white/70" />
                ) : (
                  <div aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#E8D9E4] font-display text-2xl font-semibold text-[#553D68]">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="font-display text-3xl font-semibold sm:text-4xl">{displayName}</h1>
                  <p className="mt-1 text-sm text-[#EBDDE8]">{readBooks.length} {readBooks.length === 1 ? "bok lest" : "bøker lest"}</p>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <Link href="/profile/edit" className="rounded-xl border border-[#EBDDE8]/50 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3C66E]">
                Rediger profil
              </Link>
            )}
          </div>
          {profileResult.data.bio && <p className="mt-5 max-w-2xl leading-7 text-[#F4EAF1]">{profileResult.data.bio}</p>}
        </header>

        {hasError ? (
          <p role="status" className="mt-8 rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-5 text-sm text-red-700">
            Kunne ikke laste hele profilen. Prøv å oppdatere siden.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <section className="rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-5 sm:p-7">
              <div className="flex items-end justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold">Bøker lest</h2>
                <span className="text-sm text-[#594653]">{readBooks.length}</span>
              </div>
              {readBooks.length ? (
                <ul className="mt-4 divide-y divide-[#E1D6CC]">
                  {readBooks.map((book) => (
                    <li key={book.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      {book.cloudinaryPath ? (
                        <img src={book.cloudinaryPath} alt="" className="h-16 w-11 shrink-0 rounded-md object-cover" />
                      ) : (
                        <div aria-hidden="true" className="flex h-16 w-11 shrink-0 items-center justify-center rounded-md bg-[#E8D9E4] font-display text-lg font-semibold text-[#553D68]">
                          {book.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{book.name}</p>
                        {book.author && <p className="mt-1 text-sm text-[#594653]">{book.author}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-[#594653]">Ingen bøker lagt til ennå.</p>
              )}
            </section>

            <section className="rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-5 sm:p-7">
              <div className="flex items-end justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold">Vurderinger</h2>
                <span className="text-sm text-[#594653]">{reviewsResult.data?.length ?? 0}</span>
              </div>
              {reviewsResult.data?.length ? (
                <ul className="mt-4 space-y-4">
                  {reviewsResult.data.map((review) => {
                    const book = Array.isArray(review.Books) ? review.Books[0] : review.Books;
                    return (
                      <li key={review.id} className="rounded-xl border border-[#E1D6CC] bg-[#FFFCF7] p-4">
                        <h3 className="font-display text-lg font-semibold">{book?.name ?? "Ukjent bok"}</h3>
                        {book?.author && <p className="text-sm text-[#594653]">{book.author}</p>}
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{review.review}</p>
                        {typeof review.rating === "number" && <div className="mt-3"><DisplayStarRating value={review.rating} /></div>}
                        {typeof review.spice === "number" && <div className="mt-1"><DisplaySpiceRating value={review.spice} /></div>}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-[#594653]">Ingen vurderinger ennå.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
