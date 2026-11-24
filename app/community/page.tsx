import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import AddReadBook from "./AddReadBook";
import Link from "next/link";

type Member = { id: string; display_name: string | null; bio: string | null; avatar_url: string | null };
type ProfileBook = { profile_id: string; book_id: number };
type ReviewedBook = { user_id: string; book_id: number };
type Book = { id: number; name: string; author: string | null };

// Lists member profiles and books associated with each member in book_reviews.
export default async function CommunityPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const [userResult, memberResult, profileBookResult, reviewBookResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("id, display_name, bio, avatar_url").order("display_name").limit(100),
    supabase.from("profile_books").select("profile_id, book_id").limit(2000),
    supabase.from("book_reviews").select("user_id, book_id").not("review", "is", null).limit(2000),
  ]);

  const user = userResult.data.user;
  const { data: members, error: membersError } = memberResult;
  const { data: profileBooks, error: profileBooksError } = profileBookResult;
  const { data: reviewBooks, error: reviewBooksError } = reviewBookResult;
  const readAssociations = [
    ...(profileBooks ?? []).map((entry: ProfileBook) => ({ profileId: entry.profile_id, bookId: entry.book_id })),
    ...(reviewBooks ?? []).map((entry: ReviewedBook) => ({ profileId: entry.user_id, bookId: entry.book_id })),
  ];
  const bookIds = [...new Set(readAssociations.map((entry) => entry.bookId))];
  const booksResult = bookIds.length
    ? await supabase.from("Books").select("id, name, author").in("id", bookIds)
    : { data: [] as Book[], error: null };
  const booksById = new Map((booksResult.data ?? []).map((book) => [book.id, book]));
  const booksByMember = new Map<string, Book[]>();
  const seenMemberships = new Set<string>();

  for (const entry of readAssociations) {
    const membershipKey = `${entry.profileId}:${entry.bookId}`;
    if (seenMemberships.has(membershipKey)) continue;
    seenMemberships.add(membershipKey);

    const book = booksById.get(entry.bookId);
    if (!book) continue;
    const shelf = booksByMember.get(entry.profileId) ?? [];
    shelf.push(book);
    booksByMember.set(entry.profileId, shelf);
  }

  const ownBookIds = (booksByMember.get(user?.id ?? "") ?? []).map((book) => book.id);
  const dataError = membersError || profileBooksError || reviewBooksError || booksResult.error;

  return (
    <main className="min-h-screen bg-[#E2D9D0] px-5 py-10 text-[#331F2E] sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A9533D]">Bokklubben Lesely</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Community</h1>
          <p className="mt-2 max-w-2xl text-[#5C3C54]">Se hvem du leser sammen med, og oppdag bøker andre medlemmer har lest.</p>
        </header>

        {user && <div className="mb-10"><AddReadBook existingBookIds={ownBookIds} /></div>}

        {dataError ? (
          <section className="rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-6">
            <h2 className="font-display text-xl font-semibold">Community-bokhyllen kunne ikke lastes</h2>
            <p className="mt-2 text-[#594653]">Sjekk at brukeren har lesetilgang til profilene og bokvurderingene i Supabase.</p>
          </section>
        ) : members?.length ? (
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold">Medlemmer</h2>
              <p className="text-sm text-[#594653]">Viser {members.length} profiler</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {members.map((member: Member) => {
                const shelf = booksByMember.get(member.id) ?? [];
                return (
                  <Link
                    key={member.id}
                    href={`/members/${member.id}`}
                    className="block rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-5 shadow-[0_4px_16px_rgba(51,31,46,0.06)] transition hover:-translate-y-0.5 hover:border-[#B89EAF] hover:shadow-[0_8px_24px_rgba(51,31,46,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A9533D]"
                  >
                    <div className="flex items-center gap-3">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt="" className="size-11 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E8D9E4] font-display text-lg font-semibold text-[#553D68]">
                          {(member.display_name || "B").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-xl font-semibold">{member.display_name || "Bokklubbmedlem"}</h3>
                        <p className="text-sm text-[#594653]">{shelf.length} {shelf.length === 1 ? "bok lest" : "bøker lest"}</p>
                      </div>
                    </div>
                    {member.bio && <p className="mt-4 text-sm leading-6 text-[#594653]">{member.bio}</p>}
                    <div className="mt-4 border-t border-[#E1D6CC] pt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#76576F]">Bøker lest</h4>
                      {shelf.length ? (
                        <ul className="mt-2 space-y-2">
                          {shelf.map((book) => (
                            <li key={book.id} className="text-sm font-medium">
                              {book.name}{book.author && <span className="font-normal text-[#5D4B57]"> · {book.author}</span>}
                            </li>
                          ))}
                        </ul>
                      ) : <p className="mt-2 text-sm text-[#5D4B57]">Ingen bøker lagt til ennå.</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <p className="rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-6 text-[#594653]">Ingen profiler å vise ennå.</p>
        )}
      </div>
    </main>
  );
}
