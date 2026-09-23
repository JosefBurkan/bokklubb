import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

export default async function Eventer() {

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
  
    const { data: events, error } = await supabase
      .from("eventer")
      .select("*")
  
    if (error) {
      console.error(
        "Error fetching events:",
        error
      );
    }

    return (

    <>
        <h1>
            Dette er alle de eksisterende eventene. Alt under er hentet fra 'eventer' tabellen
        </h1>
        
        {/* Dette er for eventet og deltakerne*/}
        <div>
            
        {events.map((event) => (
            <h1 key={event.id}>
            <br/>
            {event.description}

            <br/>
            Deltakere:
            <br/>
            {event.listOfParticipants}
            </h1>
        ))}          
        </div>
    </>
    );
  }
  