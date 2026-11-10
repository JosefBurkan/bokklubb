import Link from "next/link";

import { cookies } from "next/headers";

import { createClient } from "@/supabase/server";

import EventCard from "./components/EventCard";

export default async function Home() {

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore)

  const [eventData, bookData] = await Promise.all([
    supabase.from("eventer").select("*"),
    supabase.from("Books").select("*").eq("active", true).limit(1),
  ]);
  
  // transformer hele spørringenen om til arrays med kun dataen
  const events = eventData.data ?? [];
  const book = bookData.data?.[0] ?? null;
  
  return (
    <div className="relative overflow-hidden">

    {/* Introduksjon (Logo, overskrift, Mørk bakgrunn)  */}
    <div className="relative min-h-[460px] bg-[#331F2E]">
        <div className="relative mx-auto flex max-w-[1240px] flex-col gap-[22px] px-6 pb-20 pt-[72px] text-[#FCF3E5]">
          
          <div className="flex items-baseline gap-[26px]">
              <img src="logo-bue.svg"/>

            <span className="font-['Playfair_Display',serif] text-[clamp(80px,10vw,144px)] leading-none tracking-[-1.5px] text-[#F4C3A8]">
              Lese
              <span className="italic tracking-normal text-[#F2C676]">
                Ly
              </span>
            </span>
          </div>

          <h1 className="mt-1 font-normal">
            Et ly å lese i.
          </h1>

          <p className="m-0 max-w-[420px] text-[19px] text-[#E3CDDD]">
            For deg som savner det lille rommet der verden kunne vente.
          </p>
        </div>
      </div>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16 md:py-24">
        <section className="flex flex-col-reverse items-center gap-10 md:flex-row md:justify-between">
          <div className="max-w-xl text-center md:text-left">
            <h1 className="text-3xl md:text-4xl text-black">
              Kommende arrangementer
            </h1>
          </div>

        </section>

        {/* Kommende Arrangementer */}
        <div className="flex items-start justify-between gap-6 pb-10">
          <div className="grid grid-cols-3 gap-5">
            {events.map((event) => (
              <div key={event.id} className="w-60 h-60">
                <EventCard
                  id={event.id}
                  title={event.title}
                  category={event.category}
                  description={event.description} />
              </div>
            ))}
          </div>

          <div
            href="/book-of-the-month"
            className="group flex h-100 w-80 shrink-0 flex-col rounded-lg bg-[#E3CDDD] p-8"
          >
            <p>Gode bøker,</p>
            <p>Bedre dager</p>
            <p>🦋</p>

            <div className="mt-auto flex items-end justify-between gap-4">
              <div className="min-w-0 text-left">
                <h1 className="font-display text-xl pb-3">Månedens bok</h1>
                {book ? (
                  <>
                    <p className="font-bold">{book.name}</p>
                    {book.author && <p className="pb-5">{book.author}</p>}
                    <Link
                      href="/book-of-the-month"
                      className="underline text-[#85597A]"
                    >
                      Les mer →
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="pb-5">
                      {bookData.error
                        ? "Månedens bok kunne ikke hentes akkurat nå."
                        : "Ingen månedens bok er valgt akkurat nå."}
                    </p>
                    <Link
                      href="/prev-books-of-the-month"
                      className="underline text-[#85597A]"
                    >
                      Se tidligere bøker →
                    </Link>
                  </>
                )}
              </div>

              {book?.cloudinaryPath && (
                <img
                  src={book.cloudinaryPath}
                  alt={`Omslag: ${book.name}`}
                  className="max-w-28 shrink-0 rounded-sm"
                />
              )}

            </div>
          </div>
        </div>

        { /* Et kapittel om gangen, sammen */ }
        <div className="flex">
          <div className="w-100">
            <p className="">
              Les med meg
            </p>
            <h1 className="text-3xl">
              Et kapittel om gangen. Sammen
            </h1>

            <p>
              Kamilla dykker ned i bøkene vi leser sammen i klubben:
              hva som skjer, hvem vi heier på, og alt vi ikke klarer å
              slutte å tenke på. På YouTube og som podcast.
            </p>
          </div>

          <div className="bg-[#5C3C54] w-130 h-70 rounded-3xl ml-auto">
            <p className="p-5 text-[#EEBFB2]">Bokprat med Kamilla</p>
          </div>
          
        </div>

      </main>

    </div>
  );
}
