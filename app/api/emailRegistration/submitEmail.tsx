'use server'

import { cookies } from "next/headers";
import { redirect } from 'next/navigation'
import { createClient } from "@/supabase/server";
import SendMail from "@/resend/sendMail";
import sendDiscordMessage from "@/discord/sendDiscordMessage";

export default async function submitEmail(formData: FormData) {

  const title = String(formData.get('email'))
  

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
  if (!emailExists)
  {
    if (title && title.includes("@")) {

      const { data } = await supabase
        .from("listOfMembers")
        .insert({ email: title });

      console.log({ data })

      SendMail(title);

      await sendDiscordMessage(
        `${title} er nå en del av klubben!`,
        "Nå er du en del av verdens kuleste bokklubb"
      );

      redirect('/newsLetter')
    }
    else 
    {
      console.log(`Ugyldig data: ${title}`)
    }
  }
  else
  {
      console.log("Brukeren eksisterer allerede")    
  }
}