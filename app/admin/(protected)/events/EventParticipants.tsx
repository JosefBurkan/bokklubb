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
      <p className="rounded-xl bg-white p-6 text-gray-600">
        Ingen har meldt seg på dette eventet ennå.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-xl bg-white shadow-sm">
      {names.map((name, index) => (
        <li key={`${name}-${index}`} className="px-5 py-4 text-gray-900">
          {name}
        </li>
      ))}
    </ul>
  );
}
