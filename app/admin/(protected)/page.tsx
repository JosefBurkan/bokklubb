import Link from "next/link";

const ADMIN_SECTIONS = [
  {
    number: "01",
    title: "Arrangementer",
    description: "Opprett arrangementer, oppdater detaljer og følg med på påmeldte.",
    href: "/admin/events",
    tone: {
      card: "bg-[#F8E8E1] border-[#E9C9BC]",
      marker: "bg-[#A9533D]",
      action: "bg-[#A9533D] text-white group-hover:bg-[#8E422F]",
    },
  },
  {
    number: "02",
    title: "Bøker",
    description: "Administrer månedens bok og hold orden på hele bokarkivet.",
    href: "/admin/books",
    tone: {
      card: "bg-[#F8F0D9] border-[#E8D8A9]",
      marker: "bg-[#8A6726]",
      action: "bg-[#8A6726] text-white group-hover:bg-[#72541F]",
    },
  },
  {
    number: "03",
    title: "Nyhetsbrev",
    description: "Skriv, utform og send nyheter til bokklubbens medlemmer.",
    href: "/admin/news-letter",
    tone: {
      card: "bg-[#F9EFF7] border-[#E1CADB]",
      marker: "bg-[#5C3C54]",
      action: "bg-[#5C3C54] text-white group-hover:bg-[#452D40]",
    },
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-full flex-1 bg-[#E7DCE8] px-6 py-10 text-[#331F2E] sm:py-14">
      <div className="mx-auto max-w-6xl">
        {/* Welcome banner uses the homepage's plum background and warm accent colors. */}
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#331F2E] px-7 py-9 text-[#FCF3E5] shadow-lg shadow-[#331F2E]/10 sm:px-10 sm:py-12">
          {/* Decorative arches echo the Lesely mark and fill the open side of the banner. */}
          <div aria-hidden="true" className="absolute right-10 top-1/2 z-0 hidden -translate-y-1/2 items-end gap-3 opacity-90 sm:flex lg:right-20">
            <div className="h-32 w-20 rounded-t-full border-[10px] border-[#A9533D] border-b-0" />
            <div className="h-44 w-28 rounded-t-full border-[12px] border-[#F2C676] border-b-0" />
            <div className="h-36 w-24 rounded-t-full border-[10px] border-[#E8B7A7] border-b-0" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#F2C676]">
              Lesely · Administrasjon
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              Adminpanel
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[#F3D8D2] sm:text-lg">
              Alt du trenger for å holde bokklubben levende, samlet på ett sted.
            </p>
          </div>
        </section>

        {/* Main admin destinations. */}
        <section className="mt-10 sm:mt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A9533D]">
                Arbeidsområder
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                Hva vil du administrere?
              </h2>
            </div>
            <p className="text-sm text-[#5C3C54]">Velg et område for å komme i gang.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {ADMIN_SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className={`group relative flex min-h-64 flex-col overflow-hidden rounded-2xl border p-6 shadow-[0_8px_24px_rgba(51,31,46,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(51,31,46,0.14)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A9533D] ${section.tone.card}`}
              >
                <div className="relative flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[0.16em] text-[#5C3C54]/70">
                    {section.number} / 03
                  </span>
                  <span aria-hidden="true" className={`h-1.5 w-12 rounded-full ${section.tone.marker}`} />
                </div>
                <h3 className="relative mt-7 font-display text-2xl font-semibold text-[#331F2E]">
                  {section.title}
                </h3>
                <p className="relative mt-2 max-w-xs text-sm leading-6 text-[#5C3C54]">
                  {section.description}
                </p>
                <span className={`relative mt-auto inline-flex w-fit items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition ${section.tone.action}`}>
                  Åpne område
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
