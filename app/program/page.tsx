import { Calendar } from "../components/Calendar"

import { cookies } from "next/headers";

import { createClient } from "@/supabase/server";

export default async function program() {

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore)

    const { data , error } = await supabase
        .from("eventer")
        .select("*");
    
    return (
        <Calendar events={ data } />
    );
    
}