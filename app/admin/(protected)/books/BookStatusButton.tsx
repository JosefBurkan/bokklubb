"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BookStatusButtonProps = {
  bookId: number;
  active: boolean;
};

// Activates a book as the monthly selection or archives the current selection.
export default function BookStatusButton({
  bookId,
  active,
}: BookStatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus() {
    setLoading(true);

    try {
      // The API toggles this book's active state; refresh after it succeeds.
      const response = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      const result = await response.json();

      if (!response.ok) {
        window.alert(result.error ?? "Kunne ikke endre månedens bok.");
        return;
      }

      router.refresh();
    } catch {
      window.alert("Kunne ikke kontakte serveren. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Button label and color depend on whether this is currently the active book. */
    <button
      type="button"
      onClick={updateStatus}
      disabled={loading}
      className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-semibold disabled:cursor-wait disabled:opacity-50 ${
        active
          ? "border-[#B8A8A0] bg-[#FFFCF7] text-[#594653] hover:bg-[#F0E7DE]"
          : "border-[#331F2E] bg-[#331F2E] text-white hover:bg-[#5C3C54]"
      }`}
    >
      {loading
        ? "Oppdaterer..."
        : active
          ? "Fjern månedens bok"
          : "Sett som månedens bok"}
    </button>
  );
}
