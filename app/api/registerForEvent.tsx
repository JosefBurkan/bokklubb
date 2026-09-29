'use server'

import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "@/node_modules/next/cache";

export default async function registerForEvent(formdata: FormData)
{
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore)

    const name = formdata.get("name") as string
    const id = formdata.get("eventId") as string

    //  Må hente dataen først siden 'listOfParticipants' er en liste, og ikke en enkelverdi, og det har ikke supabase API innebygd
    const { data: event, error: fetchError } = await supabase
    .from("eventer")
    .select("listOfParticipants")
    .eq("id", id)
    .single();

    if (fetchError) {
        console.error("Fetch feilet:", fetchError);
        throw new Error(fetchError.message);
    }

    // Først må lista med deltakere hentes inn
    // Så kan navnet legges inn, og deretter lista sendes tilbake
    // Hvis ikke så overskrives hele lista med det nyeste navnet
    const participants = [...(event.listOfParticipants ?? []), name];

    const { data, error } = await supabase
        .from("eventer")
        .update({ listOfParticipants: participants})
        .eq("id", id)
        .select("*")
        .single();
    
    console.log(`${data} er lagt til i databasen!`)
    
    if (error)
    {
        throw new Error(error.message)
    }

    revalidatePath("/events")
}

