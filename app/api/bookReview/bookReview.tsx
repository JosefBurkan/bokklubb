'use server'

import { redirect } from 'next/navigation'
import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";

export default async function addReview(formData: FormData) {
    
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser();

    const username =
    user.user_metadata?.preferred_username ??
    user.user_metadata?.user_name ??
    user.user_metadata?.username ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    "Bokklubbmedlem";

    let userName = user?.display_name ?? username;


    const r_review = formData.get('review') as String
    const r_rating = formData.get('rating') as String
    const r_spice = formData.get('spice') as String

    const { data: book_reviews, error } = await supabase
        .from("book_reviews")
        .insert({
            review: r_review,
            user_id: user.id,
            book_id: 1,
            made_by: userName,
            rating: r_rating,
            spice: r_spice
        });
    
    if (error) {
        console.error(
            "Error inserting review:",
            error
        );
        }
    
    console.log(book_reviews)


    redirect('book-of-the-month')

}