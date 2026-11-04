import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import DisplayStarRating from "@/app/components/Reviews/DisplayStarRating";
import DisplaySpiceRating from "@/app/components/Reviews/DisplaySpiceRating";
import Link from "@/node_modules/next/link";

export default async function reviews()
{
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    {/* Henter månedens bok for å bruke ID'en dens i reviews-fetchen */}
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
        .eq("book_id", book.id)
    
    if (error) {
        console.error(
            "Error fetching events:",
            error
        );
    }
    
    
    return (
        <>
            <div className="relative mx-auto flex max-w-[1240px] flex-col gap-[22px] pt-[72px] text-[#FCF3E5]">
                
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {reviews.map((review) => (
                        <div key={review.id} className="p-5 w-100">
                        <p className="text-sm text-gray-500">Skrevet av {review.made_by}</p>
                        <p className="min-h-30 w-full bg-white text-sm text-black">{review.review}</p>

                        <DisplayStarRating value={review.rating} />
                        <DisplaySpiceRating value={review.spice} />
                        </div>
                    ))}
                </div>
            </div>


            <Link href="/book-of-the-month"
                className="underline text-center pb-10">
                    Gå tilbake til månedens bok →
            </Link>
        </>
    );
}