
import AddReview from "../components/Reviews/AddReview";
import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";

export default async function writeReview() {

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser();

    if (user)
    {
        return (
            <AddReview/>
         );
    }
    else if (!user)
    {
        return (
            <p className="mx-auto mt-30 p-10 bg-white rounded-2xl">
                Du må være logget inn for å skrive en vurdering
            </p>  
        );
    }


}