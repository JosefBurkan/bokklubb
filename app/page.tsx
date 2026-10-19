import Link from "next/link";

export default async function Home() {

  return (
    <div>

      <div className="flex flex-col items-center gap-4 text-white">

        <p>Velkommen til Kamilla sin bokklubb. Her kan du finne både månedens bok, og kommende eventer</p>
        <br />
        
        

        <div className="grid grid-cols-2 gap-25">

          <Link href="/book-of-the-month"
            className="bg-yellow-500 p-10 rounded text-center">
            Månedens bok</Link>

          <Link href="/events"
            className="bg-yellow-500 p-10 rounded text-center">
            Eventer</Link>
          
        </div>

      </div>

    </div>
  );
}
