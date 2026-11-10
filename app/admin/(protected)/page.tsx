import Link from "next/link";
import { cookies } from "next/headers";

import { createClient } from "@/supabase/server";

type ActivityItem = {
  id: string;
  kind: "book" | "registration";
  action: string;
  title: string;
  createdAt: string;
  href: string;
};

// Format timestamps in the book club's local timezone for the dashboard.
function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(new Date(value));
}

// Event dates are entered as Oslo-local datetime values in the admin form.
function getOsloLocalTimestamp(value: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "00";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}:${part("second")}`;
}

// Render the admin overview with counts and activity fetched from Supabase.
export default async function AdminPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const now = new Date();
  const nowLocal = getOsloLocalTimestamp(now);

  // Fetch summary totals and the newest records together to keep the page quick.
  const [
    { data: books, count: bookCount, error: booksError },
    { count: subscriberCount, error: subscribersError },
    { data: upcomingEvents, count: upcomingEventCount, error: upcomingError },
    { data: registrations, error: registrationsError },
  ] = await Promise.all([
    supabase
      .from("Books")
      .select("id, name, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("listOfMembers")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("eventer")
      .select("id, date, title, description, category, listOfParticipants", { count: "exact" })
      .gte("date", nowLocal)
      .order("date", { ascending: true })
      .limit(1),
    supabase
      .from("event_registrations")
      .select("id, event_id, participant_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Keep dashboard failures visible in server logs instead of presenting false zeroes.
  if (booksError) console.error("Could not load dashboard books:", booksError.message);
  if (subscribersError) console.error("Could not count newsletter subscribers:", subscribersError.message);
  if (upcomingError) console.error("Could not load upcoming events:", upcomingError.message);
  if (registrationsError) console.error("Could not load recent registrations:", registrationsError.message);

  const nextEvent = upcomingEvents?.[0] ?? null;
  const activitySourceError = Boolean(booksError || registrationsError);

  // Combine the timestamped book and signup records available in the schema.
  const activity: ActivityItem[] = [
    ...(books ?? []).map((book) => ({
      id: `book-${book.id}`,
      kind: "book" as const,
      action: "Lagt til i bokhyllen",
      title: book.name,
      createdAt: book.created_at,
      href: "/admin/books",
    })),
    ...(registrations ?? []).map((registration) => ({
      id: `registration-${registration.id}`,
      kind: "registration" as const,
      action: "Påmelding mottatt",
      title: registration.participant_name,
      createdAt: registration.created_at,
      href: `/admin/events/${registration.event_id}`,
    })),
  ]
    .filter((item) => item.title && item.createdAt)
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .slice(0, 5);

  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Oslo",
  }).format(now));
  const greeting = hour < 12 ? "God morgen" : hour < 18 ? "God dag" : "God kveld";
  const today = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Oslo",
  }).format(now);

  const summaryCards = [
    {
      label: "Kommende arrangementer",
      value: upcomingError ? null : upcomingEventCount,
      href: "/admin/events",
      accent: "bg-[#C85F48]",
    },
    {
      label: "Bøker i bokhyllen",
      value: booksError ? null : bookCount,
      href: "/admin/books",
      accent: "bg-[#B58A37]",
    },
    {
      label: "Nyhetsbrevabonnenter",
      value: subscribersError ? null : subscriberCount,
      href: "/admin/news-letter",
      accent: "bg-[#A66C91]",
    },
  ];

  const quickActions = [
    {
      number: "01",
      title: "Opprett arrangement",
      description: "Opprett en ny samling for bokklubben",
      href: "/admin/events/new",
    },
    {
      number: "02",
      title: "Legg til bok",
      description: "Oppdater bokhyllen med neste lesning",
      href: "/admin/books/new",
    },
    {
      number: "03",
      title: "Skriv nyhetsbrev",
      description: "Del siste nytt med medlemmene",
      href: "/admin/news-letter",
    },
  ];

  const nextEventHasTimezone = nextEvent
    ? /(?:Z|[+-]\d{2}:?\d{2})$/i.test(nextEvent.date)
    : false;
  const nextEventDate = nextEvent
    ? new Date(nextEventHasTimezone ? nextEvent.date : `${nextEvent.date}Z`)
    : null;
  const nextEventTimeZone = nextEventHasTimezone ? "Europe/Oslo" : "UTC";
  const nextEventMonth = nextEventDate
    ? new Intl.DateTimeFormat("nb-NO", { month: "short", timeZone: nextEventTimeZone })
        .format(nextEventDate)
        .replace(".", "")
        .toUpperCase()
    : null;

  return (
    <main className="min-h-full flex-1 bg-[#E2D9D0] px-5 py-8 text-[#331F2E] sm:px-8 sm:py-10 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        {/* Greeting and primary action orient the admin when they arrive. */}
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A9533D]">
              {today}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              {greeting}
            </h1>
            <p className="mt-2 text-sm text-[#6A5364] sm:text-base">
              Her er det som skjer i bokklubben din akkurat nå.
            </p>
          </div>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#493447] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5D4358] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A9533D]"
          >
            <span aria-hidden="true" className="text-lg leading-none">+</span>
            Opprett arrangement
          </Link>
        </header>

        {/* Live summary cards link directly to the collection behind each total. */}
        <section aria-label="Oversiktstall" className="grid gap-3 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group flex min-h-28 items-center gap-4 rounded-2xl border border-[#D4C8BE] bg-[#EAE3DC] p-5 shadow-[0_4px_16px_rgba(51,31,46,0.04)] transition hover:-translate-y-0.5 hover:border-[#B9A5B4] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A9533D] sm:p-6"
            >
              <span aria-hidden="true" className={`h-12 w-1.5 shrink-0 rounded-full ${card.accent}`} />
              <span className="min-w-0">
                <span className="block font-display text-3xl font-semibold leading-none text-[#331F2E] sm:text-4xl">
                  {card.value === null ? "—" : card.value?.toLocaleString("nb-NO") ?? "0"}
                </span>
                <span className="mt-2 block text-sm text-[#705D6C]">{card.label}</span>
              </span>
            </Link>
          ))}
        </section>

        {/* Quick admin tasks sit beside the next event for a useful first screen. */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_1fr]">
          <section className="rounded-2xl border border-[#D4C8BE] bg-[#EAE3DC] p-5 shadow-[0_4px_16px_rgba(51,31,46,0.04)] sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A9533D]">Kom i gang</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Hva vil du gjøre?</h2>
            <div className="mt-4 divide-y divide-[#D7CCC3]">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-4 py-4 transition first:pt-2 last:pb-1 hover:text-[#8E4938] focus-visible:outline-2 focus-visible:outline-[#A9533D]"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#DED0D1] font-display text-sm font-semibold text-[#714E62]">
                    {action.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-base font-semibold text-[#3B2938]">{action.title}</span>
                    <span className="mt-1 block text-xs text-[#5F4C59] sm:text-sm">{action.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#D4C8BE] bg-[#EAE3DC] p-5 shadow-[0_4px_16px_rgba(51,31,46,0.04)] sm:p-7">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A9533D]">Neste på planen</p>
                <h2 className="mt-2 font-display text-2xl font-semibold">Kommende arrangement</h2>
              </div>
              <Link href="/admin/events" className="shrink-0 text-xs font-semibold text-[#76576F] underline decoration-[#B99AAD] underline-offset-4 hover:text-[#A9533D]">
                Se alle
              </Link>
            </div>

            {nextEvent && nextEventDate ? (
              <div className="mt-5 flex min-h-44 overflow-hidden rounded-xl bg-[#493447] text-[#FCF3E5]">
                <div className="flex w-24 shrink-0 flex-col items-center justify-center bg-[#674A60] px-3 text-center sm:w-28">
                  <span className="text-[10px] font-bold tracking-[0.18em] text-[#F2C676]">{nextEventMonth}</span>
                  <span className="mt-1 font-display text-4xl font-semibold leading-none">
                    {new Intl.DateTimeFormat("nb-NO", { day: "numeric", timeZone: nextEventTimeZone }).format(nextEventDate)}
                  </span>
                  <span className="mt-2 text-[11px] text-[#EADCE6]">
                    {new Intl.DateTimeFormat("nb-NO", { weekday: "long", timeZone: nextEventTimeZone }).format(nextEventDate)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center p-5 sm:p-6">
                  <span className="w-fit rounded-full bg-[#8A5962] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#FFF2E8]">
                    {nextEvent.category}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold leading-snug sm:text-xl">
                    {nextEvent.title?.trim() || nextEvent.description}
                  </h3>
                  {nextEvent.title?.trim() && nextEvent.description && nextEvent.title !== nextEvent.description && (
                    <p className="mt-1 text-xs text-[#E4D5E0] sm:text-sm">{nextEvent.description}</p>
                  )}
                  <p className="mt-2 text-xs text-[#E4D5E0] sm:text-sm">
                    {new Intl.DateTimeFormat("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: nextEventTimeZone,
                    }).format(nextEventDate)}
                  </p>
                  <p className="mt-3 text-xs text-[#F2C676]">
                    {nextEvent.listOfParticipants?.length ?? 0} påmeldte
                  </p>
                  <Link
                    href={`/admin/events/${nextEvent.id}`}
                    className="mt-4 w-fit text-xs font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                  >
                    Se arrangement
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex min-h-44 flex-col items-start justify-center rounded-xl border border-dashed border-[#C9B9C2] bg-[#E5DDD5] px-6">
                <p className="font-semibold text-[#493447]">
                  {upcomingError ? "Kunne ikke hente arrangementer akkurat nå." : "Ingen kommende arrangementer."}
                </p>
                <Link href="/admin/events/new" className="mt-3 text-sm font-semibold text-[#8E4938] underline underline-offset-4">
                  Opprett et arrangement
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Recent activity is built from timestamped book and signup records. */}
        <section className="mt-5 rounded-2xl border border-[#D4C8BE] bg-[#EAE3DC] p-5 shadow-[0_4px_16px_rgba(51,31,46,0.04)] sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A9533D]">Siste nytt</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">Nylig aktivitet</h2>
            </div>
            <p className="text-xs text-[#5F4C59]">Siste fem oppdateringer</p>
          </div>

          {activity.length > 0 ? (
            <ul className="mt-4 divide-y divide-[#D7CCC3]">
              {activity.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 transition hover:text-[#8E4938]">
                    <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${item.kind === "book" ? "bg-[#B58A37]" : "bg-[#A66C91]"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-[#5F4C59]">{item.action}</span>
                      <span className="mt-0.5 block truncate text-sm font-semibold text-[#3B2938]">{item.title}</span>
                    </span>
                    <time dateTime={item.createdAt} className="ml-auto text-xs text-[#5F4C59]">
                      {formatTimestamp(item.createdAt)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-xl bg-[#E5DDD5] px-4 py-5 text-sm text-[#5F4C59]">
              {activitySourceError
                ? "Kunne ikke hente aktivitetsoversikten akkurat nå."
                : "Ingen nylig aktivitet er registrert ennå."}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
