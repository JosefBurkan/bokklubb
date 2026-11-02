import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import Link from "@/node_modules/next/link";
import DisplayStarRating from "../components/Reviews/DisplayStarRating";
import DisplaySpiceRating from "../components/Reviews/DisplaySpiceRating";

export default async function Manedens_Bok() {

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Brukes til å vise datoen igjennom "created_at"-tabellen fra databasen
    const months = ["Januar", "Februar", "Mars",
                    "April", "Mai", "Juni",
                    "Juli", "August", "September",
                    "Oktober", "November", "Desember"]
    
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Navnet til brukeren man er logget inn på
    const displayName = user?.user_metadata?.name;

    console.log(`navnet til brukeren er ${displayName}`)
  
    // Hent den aktive boka her
    // Aktiv betyr månedens bok
    const { data: book, error } = await supabase
        .from("Books")
        .select("*")
        .eq("active", true)
        .single();
  
    if (error) {
      console.error(
        "Error fetching events:",
        error
      );
    }

    const { data: reviews } = await supabase
        .from("book_reviews")
        .select("*")
        .eq("book_id", 1);
    
    if (error) {
        console.error(
            "Error fetching events:",
            error
        );
    }
  
    console.log(book);
    console.log(reviews);

    return (

    <div className="relative overflow-hidden">
                
    <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-16 px-6 py-16 md:py-24">
        <section className="flex flex-col-reverse items-center gap-10 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
                <p className="font-family: 'Space Mono', monospace; pb-5 text-[#C76247]">
                    Bøker
                </p>
                        
                <h1 className="text-6xl md:text-6xl text-black">
                    Dette har vi lest sammen
                </h1>
          </div>
        </section>
    </div>

            
        <div className="flex flex-col items-center">
        
            <br />
                
            <p key={book.id}>
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
            </p>
                
            <p className="pt-15 pb-5">
                Community reviews 📖
            </p>
                
                <Link href="write-review"
                      className="mr-68 p-3 underline">
                Skriv en review →
            </Link>
                
            {reviews.map((review) => (
                <div key={review.id} className="p-5">
                    <p className="text-sm text-gray-500">
                       Skrevet av {review.made_by} 
                    </p>
                    
                    <p className="text-sm bg-white w-100 h-30">
                        {review.review}
                    </p>

                    <DisplayStarRating value={review.rating} />
                    <DisplaySpiceRating value={review.spice} />
                </div>
            ))} 
            
            <br/>
                
            <Link href="/prev-books-of-the-month" >
                Arkiv av tidligere månedens bøker
            </Link>
            </div>
            
    </div>
            
    );

  }
  