import Link from "next/link";

import { cookies } from "next/headers";

import { createClient } from "@/supabase/server";

import DeleteEventButton from "@/app/components/DeleteEventButton";

export default async function AdminEventsPage() {
  const cookieStore = await cookies();

  const supabase = createClient(cookieStore);

  const { data: events, error } = await supabase
    .from("eventer")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error(
      "Error fetching events:",
      error
    );
  }

  return (
    <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Administrer eventer
            </h1>

            <p className="mt-2 text-gray-600">
              Opprett, rediger og slett eventer.
            </p>
          </div>

          <Link
            href="/admin"
            className="
              rounded-lg
              border
              border-gray-300
              bg-white
              px-4
              py-2
              font-medium
              text-gray-700
              transition
              hover:bg-gray-50
            "
          >
            ← Tilbake til adminpanel
          </Link>
        </div>

        {/* Create event button */}
        <div className="mb-8">
          <Link
            href="/admin/events/new"
            className="
              inline-block
              rounded-lg
              bg-black
              px-5
              py-3
              font-semibold
              text-white
              transition
              hover:bg-gray-700
            "
          >
            + Opprett event
          </Link>
        </div>

        {/* Events */}
        <section>
          <h2 className="mb-5 text-xl font-semibold">
            Eventer
          </h2>

          <div className="grid gap-4">
            {events?.map((event) => (
              <div
                key={event.id}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                {/* Event information */}
                <div>
                  <h3 className="text-lg font-semibold">
                    {event.description}
                  </h3>

                  <div className="mt-2 flex gap-4 text-sm text-gray-500">
                    <span>
                      {new Date(
                        event.date
                      ).toLocaleString("no-NO")}
                    </span>

                    <span>
                      {event.category}
                    </span>

                    <span>
                      {event.listOfParticipants?.length ?? 0}{" "}
                      deltakere
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">

                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-gray-700
                      transition
                      hover:bg-gray-50
                    "
                  >
                    Rediger
                  </Link>

                  <DeleteEventButton
                    eventId={event.id}
                  />

                </div>
              </div>
            ))}

            {!events?.length && (
              <div className="rounded-xl bg-white p-8 text-center text-gray-500">
                Ingen eventer er opprettet ennå.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

