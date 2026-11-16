'use server'

import { cookies } from "next/headers";
import { redirect } from 'next/navigation'
import { createClient } from "@/supabase/server";

export default async function removeEmail() {

  // Dette er for å sjekke om eposten allerede eksisterer 
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser();

  const userName = user?.user_metadata?.name

  // Fjern eposten knyttet til brukernavnet
  const { data: userExists, error: usr} = await supabase
    .from("listOfMembers")
    .select("*")
    .eq("account_name", userName)
    .maybeSingle();

  if (usr) {
    console.error(
      "Error fetching events:",
      usr
    );
  }

  // Legg inn eposten kun om den ikke finnes
  if (userExists)
  {
    const { data } = await supabase
        .from("listOfMembers")
        .delete()
        .eq("account_name", userName);

    console.log({ data })

    redirect('/newsLetter')
  }
  else
  {
      console.log(`Fant ingen epost registrert på brukeren ${userName}`)    
  }
}