import { cookies } from "next/headers";

import { createClient } from "@/supabase/server";

import registerForEvent from "@/app/api/registerForEvent";

import Filter from "@/app/components/Filter";

type EventsPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function Eventer({
  searchParams,
}: EventsPageProps) {
  const cookieStore = await cookies();

  const supabase = createClient(cookieStore);

  // Read the category from the URL.
  //
  // Example:
  // /events
  // /events?category=Discussion
  const { category } = await searchParams;

  // Start building the Supabase query.
  let query = supabase
    .from("eventer")
    .select("*");

  // If a category was selected,
  // only fetch events belonging to that category.
  if (category) {
    query = query.eq("category", category);
  }

  const { data: events, error } = await query;

  if (error) {
    console.error(
      "Error fetching events:",
      error
    );
  }

  return (
    <>
      <h1>
        Dette er alle de eksisterende eventene.
        Alt under er hentet fra 'eventer' tabellen
      </h1>

      {/* Event category filter */}
      <Filter />

      {/* Events */}
      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events?.map((event) => (
          <form
            key={event.id}
            action={registerForEvent}
            className="ml-10 w-full rounded bg-gray-400"
          >
            {/* Event description */}
            {event.description}

            {/* Store the event ID so the
                server action knows which event
                the user is registering for */}
            <input
              type="hidden"
              name="eventId"
              value={event.id}
            />

            <br />

            {/* Event category */}
            Kategori:
            <br />

            {event.category}

            <br />
            <br />

            {/* Participants */}
            Deltakere:
            <br />

            {event.listOfParticipants?.map(
              (name: string, index: number) => (
                <p key={index}>
                  {name}
                </p>
              )
            )}

            <br />
            <br />

            {/* Registration */}
            Meld deg på her:
            <br />

            <input
              type="text"
              name="name"
              required
              placeholder="Skriv navnet ditt her"
            />

            <br />

            <button
              type="submit"
              className="mx-auto block w-20 bg-gray-500 text-center"
            >
              + Send inn
            </button>
          </form>
        ))}
      </div>
    </>
  );
}