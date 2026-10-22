import Link from "next/link";

const links = [
  {
    href: "/book-of-the-month",
    title: "Månedens bok",
    text: "Se hva vi leser akkurat nå",
    icon: "📖",
  },
  {
    href: "/events",
    title: "Eventer",
    text: "Kommende samlinger og møter",
    icon: "🕯️",
  },
  {
    href: "/program",
    title: "Program",
    text: "Leseplanen for sesongen",
    icon: "🌙",
  },
];

export default async function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Stjerner */}
      <div className="stars" aria-hidden="true" />
      <div className="stars stars-slow" aria-hidden="true" />

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16 md:py-24">
        {/* Hero */}
        <section className="flex flex-col-reverse items-center gap-10 md:flex-row md:justify-between">
          <div className="max-w-xl text-center md:text-left">
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-gold">
              ✦ Bokklubb ✦
            </p>
            <h1 className="font-display text-4xl leading-tight text-parchment md:text-6xl">
              Kamilla sin <span className="text-gold">bokklubb</span>
            </h1>
            <div className="divider mx-auto my-6 md:mx-0" />
            <p className="text-lg leading-relaxed text-parchment/80">
              Velkommen, kjære leser. Her finner du både månedens bok og
              kommende eventer. Tenn et lys, finn frem favorittkoppen og la
              deg friste inn i nye verdener.
            </p>
          </div>

          <div className="relative shrink-0">
            <div className="absolute -inset-4 rounded-full bg-wine/40 blur-3xl" />
            <img
              src="front-page-image.jpg"
              alt="forsidebilde"
              width={300}
              className="relative rounded-t-full border-2 border-gold/60 shadow-2xl shadow-black/60"
            />
          </div>
        </section>

        {/* Navigasjon */}
        <section className="grid gap-6 md:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-lg border border-gold/30 bg-gradient-to-b from-wine/50 to-night/70 p-8 text-center backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_0_30px_rgba(212,175,106,0.35)]"
            >
              <div className="mb-4 text-4xl transition group-hover:scale-110">
                {link.icon}
              </div>
              <h2 className="font-display text-2xl text-gold">{link.title}</h2>
              <p className="mt-2 text-sm text-parchment/70">{link.text}</p>
            </Link>
          ))}
        </section>

        <p className="text-center font-display text-sm tracking-widest text-parchment/50">
          ✦ Hver bok er en ny reise ✦
        </p>
      </main>
    </div>
  );
}