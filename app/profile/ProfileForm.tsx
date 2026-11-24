
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";

type ProfileFormProps = {
  initialDisplayName: string;
  initialBio: string;
};

export default function ProfileForm({
  initialDisplayName,
  initialBio,
}: ProfileFormProps) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState(
    initialDisplayName
  );
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName = displayName.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName || trimmedName.length > 16) {
      setIsError(true);
      setMessage(
        "Visningsnavnet må være mellom 1 og 16 tegn."
      );
      return;
    }

    if (trimmedBio.length > 300) {
      setIsError(true);
      setMessage(
        "Beskrivelsen kan ikke være lengre enn 300 tegn."
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setIsError(false);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsError(true);
        setMessage(
          "Du er ikke logget inn. Logg inn igjen."
        );
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          display_name: trimmedName,
          bio: trimmedBio,
        })
        .eq("id", user.id)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setIsError(true);
        setMessage(
          "Fant ikke profilen din. Oppdater siden og prøv igjen."
        );
        return;
      }

      // Update the form's local state.
      setDisplayName(trimmedName);
      setBio(trimmedBio);
      setMessage("Profilen din er lagret!");

      // Refresh server components, including the navbar.
      router.refresh();
    } catch (error) {
      console.error("Profile update failed:", error);
      setIsError(true);
      setMessage(
        "Kunne ikke lagre profilen. Prøv igjen."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="displayName"
          className="mb-2 block text-sm font-semibold text-[#331F2E]"
        >
          Visningsnavn
        </label>

        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="nickname"
          required
          minLength={1}
          maxLength={16}
          value={displayName}
          onChange={(event) =>
            setDisplayName(event.target.value)
          }
          placeholder="Hva skal vi kalle deg?"
          className="w-full min-w-0 rounded-xl border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-3 text-base text-[#331F2E] outline-none transition placeholder:text-[#75636F] focus:border-[#A9533D] focus:ring-2 focus:ring-[#A9533D]/20"
        />

        <p className="mt-1 text-right text-xs text-[#76576F]">
          {displayName.length}/16 tegn
        </p>
      </div>

      <div>
        <label
          htmlFor="bio"
          className="mb-2 block text-sm font-semibold text-[#331F2E]"
        >
          Om meg
          <span className="ml-2 font-normal text-[#76576F]">
            (valgfritt)
          </span>
        </label>

        <textarea
          id="bio"
          name="bio"
          rows={5}
          maxLength={300}
          value={bio}
          onChange={(event) =>
            setBio(event.target.value)
          }
          placeholder="Fortell litt om deg selv og hvilke bøker du liker..."
          className="w-full min-w-0 resize-y rounded-xl border border-[#B8A8A0] bg-[#FFFCF7] px-4 py-3 text-base text-[#331F2E] outline-none transition placeholder:text-[#75636F] focus:border-[#A9533D] focus:ring-2 focus:ring-[#A9533D]/20"
        />

        <p className="mt-1 text-right text-xs text-[#76576F]">
          {bio.length}/300 tegn
        </p>
      </div>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${
            isError ? "text-red-700" : "text-green-800"
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-[#E1D6CC] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-[#594653]">
          Endringene påvirker bare profilen din på bokklubben.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="w-full shrink-0 rounded-xl bg-[#493346] px-6 py-3 font-semibold text-white transition hover:bg-[#5C3C54] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Lagrer..." : "Lagre profil"}
        </button>
      </div>
    </form>
  );
}
