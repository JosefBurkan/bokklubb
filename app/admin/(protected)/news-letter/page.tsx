import AdminBackLink from "../AdminBackLink";
import NewsletterComposer from "@/app/components/NewsletterComposer";

export default function NewsletterPage() {
  return (
    <main className="min-h-full flex-1 bg-[#E7DCE8] px-6 py-10 text-[#331F2E] sm:py-14">
      <div className="mx-auto max-w-6xl">
        {/* Shared link back to the admin dashboard. */}
        <AdminBackLink />

        {/* Introductory title and instructions for the newsletter editor. */}
        <header className="mb-8 mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A9533D]">Bokklubbens stemme</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#331F2E] sm:text-4xl">Nyhetsbrev</h1>
          <p className="mt-2 text-[#5C3C54]">
            Skriv og utform e-posten, se en forhåndsvisning, og send den til medlemmene.
          </p>
        </header>

        {/* The client component handles editing, preview, image selection, and sending. */}
        <NewsletterComposer />
      </div>
    </main>
  );
}
