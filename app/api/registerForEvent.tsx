'use server'

import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "@/node_modules/next/cache";

export default async function registerForEvent(formdata: FormData)
{
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser();        

    const id = formdata.get("eventId") as string

    const username =
    user.user_metadata?.preferred_username ??
    user.user_metadata?.user_name ??
    user.user_metadata?.username ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    "Bokklubbmedlem";

    let userName = user?.display_name ?? username;

    console.log(userName)


    //  Må hente dataen først siden 'listOfParticipants' er en liste, og ikke en enkelverdi, og det har ikke supabase API innebyg
    const { data: event, error: fetchError } = await supabase
    .from("eventer")
    .select("listOfParticipants")
    .eq("id", id)
    .single();

    if (fetchError) {
        console.error("Fetch feilet:", fetchError);
        throw new Error(fetchError.message);
    }

    // Hvis brukeren allerede er lagt til, avbryt prosessen
    const current: string[] = event.listOfParticipants ?? [];

    if (current.includes(userName)) {
        
        return;
    }

    // Først må lista med deltakere hentes inn
    // Så kan navnet legges inn, og deretter lista sendes tilbake
    // Hvis ikke så overskrives hele lista med det nyeste navnet
    const participants = [...(event.listOfParticipants ?? []), userName];

    const { data, error } = await supabase
        .from("eventer")
        .update({ listOfParticipants: participants})
        .eq("id", id)
        .select("*")
        .maybeSingle();
    
    console.log(`${data} er lagt til i databasen!`)
    
    if (error)
    {
        throw new Error(error.message)
    }

    revalidatePath("/events")
}

