'use server'

import { cookies } from "next/headers";
import { redirect } from 'next/navigation'
import { createClient } from "@/supabase/server";

export default async function addReview(formData: FormData) {
    
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser();

    const userName = user?.user_metadata?.name

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