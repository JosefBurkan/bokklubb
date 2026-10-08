'use server'

import { cookies } from "next/headers";
import { redirect } from 'next/navigation'
import { createClient } from "@/supabase/server";

export default async function submitEmail(formData: FormData) {

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore)

  const title = formData.get('email')

  if (title && title.includes("@")) {

    const { data, error } = await supabase
      .from("listOfMembers")
      .insert({ email: title });

    console.log({ data })

    redirect('/newsLetter')
  }
  else 
  {
    console.log(`invalid data: ${title}`)
  }
}