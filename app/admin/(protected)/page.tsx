import Link from "next/link";


export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl">

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Adminpanel
            </h1>

            <p className="mt-2 text-white/80">
              Administrer bokklubben.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">

          {/* Events */}
          <Link
            href="/admin/events"
            className="
              rounded-2xl
              bg-white
              p-6
              shadow-sm
              transition
              hover:-translate-y-1
              hover:shadow-lg
            "
          >
            <h2 className="text-xl font-bold">
              Eventer
            </h2>

            <p className="mt-2 text-gray-600">
              Opprett, rediger og slett eventer.
            </p>
          </Link>

          {/* Books */}
          <Link
            href="/admin/books"
            className="
              rounded-2xl
              bg-white
              p-6
              shadow-sm
              transition
              hover:-translate-y-1
              hover:shadow-lg
            "
          >
            <h2 className="text-xl font-bold">
              Månedens bok
            </h2>

            <p className="mt-2 text-gray-600">
              Opprett, rediger og adminstrer månedens bok.
            </p>
          </Link>

          {/* News Letter */}
          <Link
            href="/admin/news-letter"
            className="
              rounded-2xl
              bg-white
              p-6
              shadow-sm
              transition
              hover:-translate-y-1
              hover:shadow-lg
            "
          >
            <h2 className="text-xl font-bold">
              News Letter
            </h2>

            <p className="mt-2 text-gray-600">
              Send ut en epost til alle medlemmer
            </p>
          </Link>

        </div>
      </div>
    </main>
  );
}
