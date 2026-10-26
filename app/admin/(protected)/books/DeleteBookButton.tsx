"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteBookButtonProps = {
  bookId: number;
  bookName: string;
};

// Confirms permanent deletion, calls the API, and refreshes the collection.
export default function DeleteBookButton({
  bookId,
  bookName,
}: DeleteBookButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function deleteBook() {
    // Ask before removing the database row and its associated cover image.
    const confirmed = window.confirm(
      `Er du sikker på at du vil slette «${bookName}»? Boka og omslagsbildet blir fjernet. Dette kan ikke angres.`,
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        window.alert(result.error ?? "Kunne ikke slette boka.");
        return;
      }

      router.refresh();
    } catch {
      window.alert("Kunne ikke kontakte serveren. Prøv igjen.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    /* Disable the action while deletion is in progress. */
    <button
      type="button"
      onClick={deleteBook}
      disabled={deleting}
      className="inline-flex items-center rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
    >
      {deleting ? "Sletter..." : "Slett"}
    </button>
  );
}
