
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

    if (profileError || !existingProfile) {
        return <main className="mx-auto max-w-4xl px-6 py-16 text-[#331F2E]">Fant ikke profilen.</main>;
    }
    
    const { data: reviews, error } = await supabase
        .from("book_reviews")
<<<<<<< HEAD
        .select("*, Books(*), profiles(*)")
        .eq("user_id", existingProfile.id);
=======
        .select("*, Books(*)")
        .eq("user_id", existingProfile.id)
        .not("review", "is", null);
>>>>>>> c55a3194078f5444cf0787bbf962fce5dba7a547
    
    if (error) {
        console.error(
            "Error fetching events:",
            error
        );
    }
    
    return (
<<<<<<< HEAD
        <>
            <div className="relative mx-auto flex max-w-[1240px] flex-col gap-[22px] pt-[72px] text-[#FCF3E5]">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {reviews.map((review) => (
                        <div key={review.id} className="p-5 w-100">
                        <p className="text-black">{review.Books?.name}</p>
                        <p className="text-sm text-gray-500">Skrevet av {review.profiles?.display_name}</p>
                        <p className="min-h-30 w-full bg-white text-sm text-black">{review.review}</p>

                        <DisplayStarRating value={review.rating} />
                        <DisplaySpiceRating value={review.spice} />
                        </div>
=======
        <main className="min-h-screen bg-[#E2D9D0] px-5 py-10 text-[#331F2E] sm:px-8 sm:py-14">
            <div className="mx-auto max-w-5xl">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#A9533D]">Community</p>
                <h1 className="mt-2 font-display text-3xl font-semibold">Vurderinger fra {existingProfile.display_name}</h1>
                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(reviews ?? []).map((review) => (
                        <article key={review.id} className="rounded-2xl border border-[#D0C1B5] bg-[#F7F1E9] p-5 shadow-sm">
                            <h2 className="font-display text-xl font-semibold">{review.Books?.name ?? "Ukjent bok"}</h2>
                            {review.Books?.author && <p className="mt-1 text-sm text-[#5D4B57]">av {review.Books.author}</p>}
                            {review.review ? (
                                <>
                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{review.review}</p>
                                    {typeof review.rating === "number" && <div className="mt-3"><DisplayStarRating value={review.rating} /></div>}
                                    {typeof review.spice === "number" && <div className="mt-1"><DisplaySpiceRating value={review.spice} /></div>}
                                </>
                            ) : null}
                        </article>
>>>>>>> c55a3194078f5444cf0787bbf962fce5dba7a547
                    ))}
                </div>
                {(!reviews || reviews.length === 0) && <p className="mt-6 text-[#594653]">Ingen vurderinger ennå.</p>}
            </div>
        </main>
    );
}
