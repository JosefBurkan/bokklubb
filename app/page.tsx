import Link from "next/link";
import { transporter } from "@/nodemailer/nodemailer";

export default async function Home() {

  return (
    <div>
      <div></div>

      <div className="flex flex-col items-center gap-4">

        <p>Velkommen til Kamilla sin bokklubb. Her kan du finne både månedens bok, og kommende eventer</p>
        <br />
        
        

        <Link href="/book_of_the_month">Månedens bok</Link>

        <Link href="/events">Eventer</Link>

      </div>

    </div>
  );
}
