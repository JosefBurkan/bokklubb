import { cookies } from "next/headers";

import { createClient } from "@/supabase/server";

import registerForEvent from "@/app/api/registerForEvent";

import Link from "next/link";

type EventsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Events({
  params,
}: EventsPageProps) {
  const cookieStore = await cookies();

  const supabase = createClient(cookieStore);

  // Read the category from the URL.
  //
  // Example:
  // /events
  // /events?category=Discussion
  const { id } = await params;

  // Start building the Supabase query.
  let query = supabase
    .from("eventer")
    .select("*")
    .eq("id", id);

  const { data: events, error } = await query;

  if (error) {
    console.error(
      "Error fetching events:",
      error
    );
  }

  return (
    <div className="relative overflow-hidden">
    <div className="stars" aria-hidden="true" />
      <div className="stars stars-slow" aria-hidden="true" />

      {/* Events */}
      <div className="w-125 mx-auto p-10">
        {events?.map((event) => (
          <form
            key={event.id}
            action={registerForEvent}
            className="ml-10 w-full rounded bg-gray-500"
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

      <div className="text-center">
        <Link href="/program"> Gå tilbake til kalenderen</Link>
      </div>

    </div>
  );
}