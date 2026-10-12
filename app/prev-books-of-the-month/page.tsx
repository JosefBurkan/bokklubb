import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

export default async function prevBooksOfTheMonth() {


    // Brukes til å vise datoen igjennom "created_at"-tabellen fra databasen
    const months = ["Januar", "Februar", "Mars",
                    "April", "Mai", "Juni",
                    "Juli", "August", "September",
                    "Oktober", "November", "Desember"]

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Hent den aktive boka her
    // Aktiv betyr månedens bok
    const { data: books, error } = await supabase
        .from("manedens_Bok")
        .select("*")
        .eq("active", false);
  
    if (error) {
      console.error(
        "Error fetching events:",
        error
      );
    }

    console.log(books);


    return (
        <>
            <div className="text-white">
                <h1>
                Velkommen til arkivet med alle de tidligere bøkene
                </h1>

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

            </div> 

        </>
    );
    
}
  