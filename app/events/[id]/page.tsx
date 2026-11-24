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

  const { data: { user } } = await supabase.auth.getUser();   

  if (user)
  {

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
              className="ml-10 w-full rounded bg-white rounded-lg shadow-sm p-5"
            >
              {/* Show the event's title separately from its longer description. */}
              <h1 className="text-2xl">{event.title?.trim() || event.description}</h1>
              {event.title?.trim() && event.description && event.title !== event.description && (
                <p>{event.description}</p>
              )}

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
              <div className="font-bold bg-[#F6DCE8] text-center text-[#85597A] p-2 rounded-xl w-23">
                {event.category}
              </div>

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

              <input
                type="hidden"
                name="eventId"
                value={event.id}
              />

              {/* Registration */}
              Meld deg på her:
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
          <Link href="/"> Gå tilbake</Link>
        </div>

      </div>
    
    );
  }
  else if (!user)
  {
      return (
          <p className="mx-auto mt-30 p-10 bg-white rounded-2xl">
              Du må være logget inn for å melde deg på eventer
          </p>  
      );
  }
}
