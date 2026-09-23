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
  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
>
  Logg ut
</button>
  );
}