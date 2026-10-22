
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

export default async function UserStatus() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-xl bg-[#5865F2] px-4 py-2 font-semibold text-white transition hover:bg-[#4752C4]"
      >
        Logg inn med Discord
      </Link>
    );
  }

  const username =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.user_metadata?.preferred_username ??
    "Bruker";

  const avatar = user.user_metadata?.avatar_url;

  return (
    <div className="flex items-center gap-3">
      {avatar && (
        <img
          src={avatar}
          alt=""
          className="h-10 w-10 rounded-full"
        />
      )}

      <div className="min-w-0">
        <p className="text-sm text-gray-500">Logget inn som</p>
        <p className="max-w-40 truncate font-semibold">
          {username}
        </p>
      </div>

      <form action="/auth/logout" method="POST">
        <button
          type="submit"
          className="rounded-xl border border-gray-300 px-4 py-2 transition hover:bg-gray-100"
        >
          Logg ut
        </button>
      </form>
    </div>
  );
}
