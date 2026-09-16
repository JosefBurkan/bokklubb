import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div>Velkommen til Kamilla sin bokklubb</div>

      <div className="flex flex-col items-center gap-4">

        <Link href="/manedens_bok">Månedens bok</Link>

        <Link href="/eventer">Eventer</Link>

      </div>

    </div>
  );
}
