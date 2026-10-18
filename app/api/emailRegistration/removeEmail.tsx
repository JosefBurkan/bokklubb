'use server'

import { cookies } from "next/headers";
import { redirect } from 'next/navigation'
import { createClient } from "@/supabase/server";

export default async function removeEmail(formData: FormData) {

  const title = formData.get('email') as String

  // Dette er for å sjekke om eposten allerede eksisterer 
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore)
  
  const { data: emailExists, error } = await supabase
      .from("listOfMembers")
      .select("*")
      .eq("email", title)
      .limit(1)
      .maybeSingle();

  if (error) {
    console.error(
      "Error fetching events:",
      error
    );
  }

  // Legg inn eposten kun om den ikke finnes
  if (emailExists)
  {
    const { data } = await supabase
        .from("listOfMembers")
        .delete()
        .eq("email", title);

    console.log({ data })

    redirect('/newsLetter')
  }
  else
  {
      console.log(`Fant ingen registrert epost som heter ${title}`)    
  }
}