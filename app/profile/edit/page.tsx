import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import ProfileForm from "../ProfileForm";
import MyReadBooks, { type EditableBook } from "./MyReadBooks";

type ProfileBookRow = { book_id: number };

export default async function EditProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const username =
    user.user_metadata?.preferred_username ??
    user.user_metadata?.user_name ??
    user.user_metadata?.username ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    "Bokklubbmedlem";
  const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, bio")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw new Error("Kunne ikke hente profilen din.");

  if (!profile) {
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      display_name: username,
      bio: "",
    });
    if (error) throw new Error("Kunne ikke opprette profilen din.");
  }

  const { data: profileBookRows, error: shelfError } = await supabase
    .from("profile_books")
    .select("book_id")
    .eq("profile_id", user.id);
  const bookIds = [...new Set((profileBookRows ?? []).map((entry: ProfileBookRow) => entry.book_id))];
  const booksResult = bookIds.length
    ? await supabase
        .from("Books")
        .select("id, name, author, cloudinaryPath")
        .in("id", bookIds)
        .order("name")
    : { data: [] as EditableBook[], error: null };

  return (
    <main className="min-h-screen bg-[#E2D9D0] px-4 py-8 text-[#331F2E] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <Link href={`/members/${user.id}`} className="text-sm font-medium text-[#5C3C54] underline underline-offset-4 hover:text-[#A9533D]">
          ← Tilbake til profilen
        </Link>
        <div className="mb-6 mt-6 sm:mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A9533D]">Bokklubben Lesely</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Rediger profil</h1>
          <p className="mt-2 text-sm text-[#5C3C54] sm:text-base">Oppdater hvordan profilen din vises for andre medlemmer.</p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] shadow-[0_4px_16px_rgba(51,31,46,0.06)]">
          <div className="bg-[#493346] px-5 py-6 text-white sm:px-8 sm:py-8">
            <div className="flex min-w-0 items-center gap-4 sm:gap-6">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-16 w-16 shrink-0 rounded-full border-2 border-white/70 object-cover sm:h-20 sm:w-20" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E8D9E4] font-display text-2xl font-bold text-[#553D68] sm:h-20 sm:w-20">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#F3C66E]">Redigerer profilen</p>
                <h2 className="mt-1 break-words font-display text-2xl font-semibold sm:text-3xl">{profile?.display_name ?? username}</h2>
                <p className="mt-1 text-sm text-[#EBDDE8]">{username}</p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-8">
            <ProfileForm
              initialDisplayName={profile?.display_name ?? username}
              initialBio={profile?.bio ?? ""}
            />
          </div>
        </section>

        <div className="mt-7">
          {shelfError || booksResult.error ? (
            <section className="rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-5 text-sm text-red-700">
              Kunne ikke laste bokhyllen din. Prøv å oppdatere siden.
            </section>
          ) : (
            <MyReadBooks books={(booksResult.data ?? []) as EditableBook[]} />
          )}
        </div>
      </div>
    </main>
  );
}
