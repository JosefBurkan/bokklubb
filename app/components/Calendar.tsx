"use client"

import { useRouter } from 'next/navigation';

import { useState } from "react";

import Link from "next/link";

type BookEvent = {
    id: number;
    title: string;
    description?: string;
    date: string
};
  
type CalendarProps = {
    events: BookEvent[];
  };

export function Calendar({ events }: CalendarProps) {
  const router = useRouter();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string>(
    dateKey(today.getFullYear(), today.getMonth(), today.getDate())
  );
    
    
  const goToEvent = (id: number) => {
    router.push(`/events/${id}`);
  };
      
      
  const eventsByDate: Record<string, BookEvent[]> = {};
  events.forEach((event) => {
    const key = String(event.date).slice(0, 10);
    if (!eventsByDate[key]) {
      eventsByDate[key] = [];
    }
    eventsByDate[key].push(event);
  });

const monthNames = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];
const weekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Mandag som første ukedag
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function changeMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  return (
    <div className="relative overflow-hidden">
      <div className="stars" aria-hidden="true" />
      <div className="stars stars-slow" aria-hidden="true" />

      <main className="relative z-10 mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12 md:py-16">
        <header className="text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gold">
            ✦ Program ✦
          </p>
          <h1 className="font-display text-4xl text-parchment md:text-5xl">
            Bokklubbens <span className="text-gold">kalender</span>
          </h1>
          <div className="divider mx-auto my-6" />
        </header>

        {/* Kalender */}
        <section className="rounded-lg border border-gold/30 bg-gradient-to-b from-wine/50 to-night/70 p-4 backdrop-blur-sm md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="rounded border border-gold/40 px-4 py-2 text-gold transition hover:bg-gold/20"
              aria-label="Forrige måned"
            >
              ←
            </button>
            <h2 className="font-display text-2xl text-gold md:text-3xl">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="rounded border border-gold/40 px-4 py-2 text-gold transition hover:bg-gold/20"
              aria-label="Neste måned"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {weekdays.map((w) => (
              <div
                key={w}
                className="pb-2 text-center font-display text-xs uppercase tracking-widest text-parchment/60 md:text-sm"
              >
                {w}
              </div>
            ))}

            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;

              const key = dateKey(year, month, day);
              const dayEvents = eventsByDate[key];
              const isSelected = key === selected;
              const isToday = key === todayKey;
                
              const first= dayEvents?.[0] 

                return (
                    <button
                        key={key}
                        onClick={() => first && goToEvent(first.id)}
                  className={[
                    "flex aspect-square flex-col items-center rounded border p-1 text-sm transition md:items-start md:p-2",
                    isSelected
                      ? "border-gold bg-gold/25 shadow-[0_0_15px_rgba(212,175,106,0.4)]"
                      : dayEvents
                        ? "border-gold/50 bg-wine/60 hover:bg-wine/80"
                        : "border-white/10 hover:border-gold/40 hover:bg-white/5",
                    isToday ? "ring-1 ring-parchment/70" : "",
                  ].join(" ")}
                >
                  <span
                    className={
                      isToday ? "font-bold text-gold" : "text-parchment/90"
                    }
                  >
                    {day}
                  </span>

                  {dayEvents && (
                    <>
                      {/* Prikk på mobil */}
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold md:hidden" />
                      {/* Tittel på større skjermer */}
                      <span className="mt-1 hidden w-full truncate text-left text-xs text-gold md:block">
                        {dayEvents[0].title}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </section>


        <div className="text-center">
          <Link
            href="/"
            className="text-sm tracking-widest text-parchment/60 transition hover:text-gold"
          >
            ← Tilbake til forsiden
          </Link>
        </div>
      </main>
    </div>
  );
}