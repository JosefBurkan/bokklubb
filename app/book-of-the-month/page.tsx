import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import Link from "@/node_modules/next/link";
import { Main } from "@/node_modules/next/document";

export default async function Manedens_Bok() {

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Brukes til å vise datoen igjennom "created_at"-tabellen fra databasen
    const months = ["Januar", "Februar", "Mars",
                    "April", "Mai", "Juni",
                    "Juli", "August", "September",
                    "Oktober", "November", "Desember"]
  
    // Hent den aktive boka her
    // Aktiv betyr månedens bok
    const { data: books, error } = await supabase
        .from("manedens_Bok")
        .select("*")
        .eq("active", true);
  
    if (error) {
      console.error(
        "Error fetching events:",
        error
      );
    }

    console.log(books);

    return (

        <>
        <h1 className="text-white">
            Dette er månedens bok. Se under for å finne bøkene fra tidligere måneder
        </h1>
                
        <div className="text-white grid place-items-center">
        
        <br />
            
        {books.map((book) => (
            <h1 key={book.id}>
                {book.name}
                <img className="max-w-64"
                    src={book.cloudinaryPath}
                    alt={book.name}
                />
                {book.description}
                <br />
                {/* Bruker datoen til å hente riktig posisjon fra månedslista */}
                Denne boka gjelder for:&nbsp;
                {months[new Date(book.created_at).getMonth()]}
            </h1>
        ))}
            
        <br/>
            
        <Link href="/prev-books-of-the-month" >
            Arkiv av tidligere månedens bøker
                </Link>
        </div>
            
    </>
            
    );

  }
  