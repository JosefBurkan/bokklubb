import Link from "next/link";

export default async function Home() {

  return (
    <div>

      <div className="flex flex-col items-center gap-4 text-white">

        <p>Velkommen til Kamilla sin bokklubb. Her kan du finne både månedens bok, og kommende eventer</p>
        <br />
        
        

        <Link href="/book-of-the-month">Månedens bok</Link>

        <Link href="/events">Eventer</Link>

      </div>

    </div>
  );
}
