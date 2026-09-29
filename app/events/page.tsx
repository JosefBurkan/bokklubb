import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import registerForEvent from "@/app/api/registerForEvent";

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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start">
            
          {events.map((event) => (
            
            <form key={event.id}
              action={registerForEvent}
              className="bg-gray-400 rounded w-full ml-10"
          >
            {event.description}
              
            <input type="hidden" name="eventId" value={event.id} />

            <br/>
            Deltakere:
              <br />
              
              {event.listOfParticipants?.map((name: string, id: string) => (
                <p key={id}> {name}</p>
              ))}

            <br />
            <br />

            Meld deg på her:
            <br />
              <input type="text" name="name" required placeholder="Skriv navnet ditt her" />
            <br />

              <button type="submit"
                className="bg-gray-500 w-20 mx-auto block text-center"
            >
              + Send inn
            </button>
            
          </form>
          
        ))}

        </div>
    </>
    );
  }
  