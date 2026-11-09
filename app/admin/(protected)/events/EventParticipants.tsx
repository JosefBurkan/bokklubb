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
      <p className="rounded-2xl border border-[#331F2E]/10 bg-white p-6 text-[#5C3C54] shadow-sm">
        Ingen har meldt seg på dette eventet ennå.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[#331F2E]/10 rounded-2xl border border-[#331F2E]/10 bg-white shadow-sm">
      {names.map((name, index) => (
        <li key={`${name}-${index}`} className="px-5 py-4 text-[#331F2E]">
          {name}
        </li>
      ))}
    </ul>
  );
}
