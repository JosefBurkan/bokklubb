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
        .maybeSingle();
  
    if (error) {
      console.error(
        "Error fetching monthly book:",
        error
      );
    }

    // The admin can remove the monthly book, so show a useful empty state instead of dereferencing null.
    if (!book) {
        return (
            <main className="mx-auto max-w-6xl px-6 py-16">
                <h1 className="text-4xl font-bold text-black">Månedens bok</h1>
                <p className="mt-4 text-gray-700">
                    {error
                        ? "Månedens bok kunne ikke hentes akkurat nå."
                        : "Ingen månedens bok er valgt akkurat nå."}
                </p>
                <Link href="/prev-books-of-the-month" className="mt-6 inline-block underline">
                    Se tidligere bøker →
                </Link>
            </main>
        );
    }

    const { data: reviews } = await supabase
        .from("book_reviews")
        .select("*")
        .eq("book_id", book.id)
        .limit(2);

    const bookReviews = reviews ?? [];
  
    console.log(book);
    console.log(reviews);

    return (

    <div className="relative overflow-hidden">
                
    <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-16 px-6 py-16 md:pt-15">
        <section className="flex flex-col-reverse items-center gap-10 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
                <p className="font-family: 'Space Mono', monospace; pb-5 text-[#C76247]">
                    Bøker
                </p>
                        
                <h1 className="text-6xl md:text-6xl text-black">
                    Månedens bok
                </h1>
          </div>
        </section>

            
        <div className="flex flex-col items-center ">
            {/* Bok: tekst til venstre, bilde til høyre */}
            <div key={book.id} className="flex w-full  items-start justify-between p-5">
                <div className="text-left">
                    <h2 className="text-2xl font-bold">{book.name}</h2>
                    <p className="mt-2">{book.description}</p>
                    {/* Bruker datoen til å hente riktig posisjon fra månedslista */}
                    <p className="mt-4 text-sm text-gray-500">
                        Denne boka gjelder for: {months[new Date(book.created_at).getMonth()]}
                    </p>
                            
                    <div className="pt-10">
                        Vurderingen dere har gitt denne boka:        
                        {bookReviews[0] ? (
                            <DisplayStarRating value={bookReviews[0].rating} />
                        ) : (
                            <p className="mt-2 text-gray-600">Ingen vurderinger ennå.</p>
                        )}
                    </div>
                            
                    <div>
                        Spice-vurderingen dere har gitt denne boka:
                        {bookReviews[0] && <DisplaySpiceRating value={bookReviews[0].spice} />}
                    </div>
                </div>

                <img
                    className="w-32 sm:w-48 lg:w-96"
                    src={book.cloudinaryPath}
                    alt={book.name}
                />
            </div>

            {/* Alt om reviews */}
            <p className="pt-5 pb-5">
                Community reviews 📖
            </p>
                    
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {bookReviews.map((review) => (
                    <div key={review.id} className="p-5 w-100">
                    <p className="text-sm text-gray-500">Skrevet av {review.made_by}</p>
                    <p className="min-h-30 w-full bg-white text-sm">{review.review}</p>

                    <DisplayStarRating value={review.rating} />
                    <DisplaySpiceRating value={review.spice} />
                    </div>
                ))}
            </div>
                    
            <div className="grid grid-cols-1">
                
                <Link href="write-review"
                    className="underline mr-30">
                        Skriv en tilbakemelding →
                </Link>
                
                <Link href="book-of-the-month/reviews" 
                    className="underline">
                        Les resten av tilbakemeldingene →
                </Link>
            </div>
        </div>
            
    </div>
    </div>
            
    );

  }
