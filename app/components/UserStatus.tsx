
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

export default async function UserStatus() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="shrink-0 rounded-lg bg-[#5865F2] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#4752C4] sm:rounded-xl sm:px-4 sm:text-sm"
      >
        <span className="sm:hidden">Logg inn</span>
        <span className="hidden sm:inline">
          Logg inn med Discord
        </span>
      </Link>
    );
  }

  const metadata = user.user_metadata ?? {};

  const discordIdentity = user.identities?.find(
    (identity) => identity.provider === "discord"
  );

  const identityData = discordIdentity?.identity_data ?? {};

  const discordUsername =
    metadata.preferred_username ??
    metadata.user_name ??
    metadata.username ??
    metadata.global_name ??
    identityData.preferred_username ??
    identityData.user_name ??
    identityData.username ??
    identityData.global_name ??
    null;

  const fallbackName =
    metadata.full_name ??
    metadata.name ??
    identityData.full_name ??
    identityData.name ??
    "Bruker";

  const avatar =
    metadata.avatar_url ??
    metadata.picture ??
    identityData.avatar_url ??
    identityData.picture ??
    null;

  const isAdmin =
    !!process.env.ADMIN_USER_ID &&
    user.id === process.env.ADMIN_USER_ID;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const profileDisplayName =
    typeof profile?.display_name === "string"
      ? profile.display_name.trim()
      : "";

  const displayName =
    profileDisplayName || discordUsername || fallbackName;

  const hasDiscordUsername =
    typeof discordUsername === "string" &&
    discordUsername.trim().length > 0;

  const hasCustomDisplayName =
    profileDisplayName.length > 0 &&
    (!hasDiscordUsername ||
      profileDisplayName !== discordUsername);

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
      <Link
        href="/profile"
        aria-label="Gå til min profil"
        className="shrink-0 rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-8 w-8 rounded-full object-cover sm:h-10 sm:w-10"
          />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white sm:h-10 sm:w-10"
            aria-hidden="true"
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>

      <div className="hidden w-40 min-w-40 shrink-0 sm:block lg:w-32 lg:min-w-32">
        <Link
          href="/profile"
          className="block truncate text-sm font-semibold text-white hover:underline focus-visible:underline"
        >
          {displayName}
        </Link>

        {isAdmin ? (
          <p className="truncate text-xs text-[#E2CFE8]">
            Admin
          </p>
        ) : hasCustomDisplayName && hasDiscordUsername ? (
          <p className="truncate text-xs text-[#E2CFE8]">
            Discord: {discordUsername}
          </p>
        ) : discordIdentity ? (
          <p className="truncate text-xs text-[#E2CFE8]">
            Logget inn med Discord
          </p>
        ) : (
          <p className="truncate text-xs text-[#E2CFE8]">
            Admin
          </p>
        )}
      </div>

      <form action="/auth/logout" method="POST">
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-[#E2CFE8]/60 px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:rounded-xl sm:px-4 sm:text-sm"
        >
          <span className="sm:hidden">Ut</span>
          <span className="hidden sm:inline">Logg ut</span>
        </button>
      </form>
    </div>
  );
}
