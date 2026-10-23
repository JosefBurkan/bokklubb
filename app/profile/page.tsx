
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const username =
  user.user_metadata?.preferred_username ??
  user.user_metadata?.user_name ??
  user.user_metadata?.username ??
  user.user_metadata?.full_name ??
  user.user_metadata?.name ??
  "Bokklubbmedlem";

  const avatarUrl =
    user.user_metadata?.avatar_url ??
    user.user_metadata?.picture ??
    null;

  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, bio")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error("Kunne ikke hente profilen din.");
  }

  let displayName = existingProfile?.display_name ?? username;
  let bio = existingProfile?.bio ?? "";

  if (!existingProfile) {
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        display_name: username,
        bio: "",
      });

    if (insertError) {
      throw new Error("Kunne ikke opprette profilen din.");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--main)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 sm:mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/90 sm:text-base">
            Bokklubben
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Min profil
          </h1>
          <p className="mt-2 text-sm text-white/80 sm:text-base">
            Administrer profilinformasjonen din.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="bg-black px-5 py-6 text-white sm:px-8 sm:py-8">
            <div className="flex min-w-0 items-center gap-4 sm:gap-6">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-full border-2 border-white/70 object-cover sm:h-20 sm:w-20"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-bold sm:h-20 sm:w-20">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-sm text-white/80">
                  Discord-konto
                </p>
                <h2 className="mt-1 break-words text-xl font-bold sm:text-2xl">
                  {username}
                </h2>
                <p className="mt-1 text-sm text-white/80">
                  Innlogget med Discord
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <ProfileForm
              initialDisplayName={displayName}
              initialBio={bio}
            />
          </div>
        </section>

        <p className="mt-4 text-center text-xs leading-relaxed text-white/80 sm:text-sm">
          Profilinformasjonen din er privat foreløpig. Du kan endre
          visningsnavn og beskrivelse uten å endre Discord-kontoen din.
        </p>
      </div>
    </main>
  );
}
