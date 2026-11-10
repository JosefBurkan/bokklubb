type EventParticipantsProps = {
  participants: string[] | null;
};

// Shows the participant names stored on the event, or an empty-state message.
export default function EventParticipants({
  participants,
}: EventParticipantsProps) {
  const names = participants ?? [];

  if (names.length === 0) {
    return (
      <p className="rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-6 text-[#594653] shadow-[0_4px_16px_rgba(51,31,46,0.06)]">
        Ingen har meldt seg på dette eventet ennå.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[#D6C9BF] rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] shadow-[0_4px_16px_rgba(51,31,46,0.06)]">
      {names.map((name, index) => (
        <li key={`${name}-${index}`} className="px-5 py-4 text-[#331F2E]">
          {name}
        </li>
      ))}
    </ul>
  );
}
