import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import DisplaySpiceRating from "@/app/components/Reviews/DisplaySpiceRating";
import DisplayStarRating from "@/app/components/Reviews/DisplayStarRating";

export default async function ReadReviews({
    params,
}: {
    params: Promise<{ id: number }>
}) {
    const { id } = await params

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: reviews, error } = await supabase
        .from("book_reviews")
        .select("*")
        .eq("book_id", id)
    
    if (error)
    {
        console.error(
            "Error fetching events:",
            error
        );
    }

    if (reviews.length === 0)
    {
        console.log("her er det ingen reviews")  
    }

    return (
        <>
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
        </>  
    );
}