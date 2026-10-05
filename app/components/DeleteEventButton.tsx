"use client";

import { useRouter } from "next/navigation";

type DeleteEventButtonProps = {
  eventId: number;
};

export default function DeleteEventButton({
  eventId,
}: DeleteEventButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Er du sikker på at du vil slette dette eventet?\n\nEventet og listen over påmeldte deltakere vil bli slettet permanent."
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(
      `/api/events/${eventId}`,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      alert(
        result.error ??
          "Kunne ikke slette eventet."
      );

      return;
    }

    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="
        rounded-lg
        border
        border-red-200
        bg-white
        px-4
        py-2
        text-sm
        font-medium
        text-red-600
        transition
        hover:bg-red-50
      "
    >
      Slett
    </button>
  );
}
