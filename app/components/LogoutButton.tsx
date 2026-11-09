"use client";

import { createClient } from "@/supabase/client";

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/admin/login";
  }

  return (
    <button
  onClick={handleLogout}
  className="rounded-lg border border-white/35 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
>
  Logg ut
</button>
  );
}
