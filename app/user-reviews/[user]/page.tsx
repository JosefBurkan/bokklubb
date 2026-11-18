
import { createClient } from "@/supabase/server";
import { cookies } from "@/node_modules/next/headers";
import DisplaySpiceRating from "@/app/components/Reviews/DisplaySpiceRating";
import DisplayStarRating from "@/app/components/Reviews/DisplayStarRating";

export default async function UserReviews({
        params,
    }: {
        params: Promise<{ user: string }>
    }) {

    const { user } = await params

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Fetch brukeren, slik at id'en dens kan bruke til å hente alle reweiene som tilhører den
    const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("display_name", user)
        .single();
    
    const { data: reviews, error } = await supabase
        .from("book_reviews")
        .select("*, Books(*)")
        .eq("user_id", existingProfile.id);
    
    return (
        <>
            <div className="relative mx-auto flex max-w-[1240px] flex-col gap-[22px] pt-[72px] text-[#FCF3E5]">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {reviews.map((review) => (
                        <div key={review.id} className="p-5 w-100">
                        <p className="text-black">{review.Books?.name}</p>
                        <p className="text-sm text-gray-500">Skrevet av {review.made_by}</p>
                        <p className="min-h-30 w-full bg-white text-sm text-black">{review.review}</p>

                        <DisplayStarRating value={review.rating} />
                        <DisplaySpiceRating value={review.spice} />
                        </div>
                    ))}
                </div>
            </div>
        </>  
    );
}