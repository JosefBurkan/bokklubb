import AdminBackLink from "../AdminBackLink";
import NewsletterComposer from "@/app/components/NewsletterComposer";

export default function NewsletterPage() {
  return (
    <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl">
        {/* Shared link back to the admin dashboard. */}
        <AdminBackLink />

        {/* Introductory title and instructions for the newsletter editor. */}
        <header className="mb-8 mt-6">
          <h1 className="text-3xl font-bold text-white">Nyhetsbrev</h1>
          <p className="mt-2 text-white/80">
            Skriv og utform e-posten, se en forhåndsvisning, og send den til medlemmene.
          </p>
        </header>

        {/* The client component handles editing, preview, image selection, and sending. */}
        <NewsletterComposer />
      </div>
    </main>
  );
}
