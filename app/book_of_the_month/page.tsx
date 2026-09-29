import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import Link from "@/node_modules/next/link";

export default async function Manedens_Bok() {

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
  
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
        <h1>
            Dette er månedens bok. Se under for å finne bøkene fra tidligere måneder
        </h1>
        
        <br />
            
        {books.map((book) => (
            <h1 key={book.id}>
                {book.name}
            </h1>
        ))}
            
        <br/>
            
        <Link href="/prev_books_of_the_month" >
            
            Arkiv av tidligere månedens bøker
        </Link>
            
    </>
            
    );

  }
  