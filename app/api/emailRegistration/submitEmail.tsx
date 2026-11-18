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

  const { data: { user } } = await supabase.auth.getUser();

  const userName = user?.user_metadata?.name
  
  const { data: emailExists, error } = await supabase
      .from("listOfMembers")
      .select("*")
      .eq("email", title)
      .maybeSingle();

  if (error) {
    console.error(
      "Error fetching events:",
      error
    );
  }

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

  // Legg inn eposten kun om den ikke finnes, og brukeren ikke har lagt inn en annen epost
  if (!emailExists && !userExists)
  {
    if (title && title.includes("@")) {

      const { data, error: errEmail } = await supabase
        .from("listOfMembers")
        .insert({ email: title, account_name: userName })
        .select();

      console.log({ data, errEmail })

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
    console.log("Brukeren eller eposten eksisterer allerede")    
  }
}