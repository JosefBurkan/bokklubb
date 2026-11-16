import SendMailButton from '@/app/components/sendMailButton';
import RemoveEmailButton from '@/app/components/RemoveEmailButton';

import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";

export default async function NewsLetter() {

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore)

    // Sjekk om brukeren er logget inn
    const { data: { user } } = await supabase.auth.getUser();

    if (user)
    {
        return (
            <div className="relative overflow-hidden bg-[#FCF3E5] py-10 px-4">
                <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
                    <div className="text-center text-[#331F2E]">
                        <h2 className="mb-3 text-xl font-semibold text-[#5C3C54]">
                            Klubbens nyhetsbrev
                        </h2>
                        <p>
                            Skriv inn eposten din her for å signe opp til klubbens nyhetsbrev!
                        </p>
                        <p className="mt-2 text-sm text-[#5C5057]">
                            Det vil kun registrere eposten du vil og navnet på brukeren din, og vil sende en epost
                            til deg hver gang klubben sender ut nyheter.
                        </p>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <SendMailButton />
                    </div>
                </div>

                <p className="text-center pt-5">
                    Vil du ikke motta flere eposter fra oss?
                    <br />
                    Meld deg ut her!

                </p>
                <RemoveEmailButton />


            </div>
        );
    }
    else if (!user)
    {
        return (
            <p className="mx-auto mt-30 p-10 bg-white rounded-2xl">
                Du må være logget inn for å melde deg opp for nyheter
            </p>  
        );
    }
        
}