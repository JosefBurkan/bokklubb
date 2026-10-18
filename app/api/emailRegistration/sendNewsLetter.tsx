'use server'

import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import SendNewsLetter from "@/resend/sendNewsLetter";

export default async function sendNewsLetter(formData: FormData) {

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore)

    const content = formData.get('newsLetter') as String

    const { data: listOfMembers } = await supabase
        .from("listOfMembers")
        .select("email");
    
    listOfMembers.forEach(element => {
        SendNewsLetter(element.email, content)
    });
}