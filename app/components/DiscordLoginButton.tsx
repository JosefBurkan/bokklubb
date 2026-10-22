
"use client";

import { createClient } from "@/supabase/client";
import { useState } from "react";

export default function DiscordLoginButton() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginWithDiscord() {
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={loginWithDiscord}
        disabled={loading}
        className="rounded-xl bg-[#5865F2] px-5 py-3 font-semibold text-white transition hover:bg-[#4752C4] disabled:opacity-50"
      >
        {loading ? "Sender deg til Discord..." : "Logg inn med Discord"}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          Kunne ikke starte Discord-innlogging: {error}
        </p>
      )}
    </div>
  );
}
