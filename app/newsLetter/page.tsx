import SendMailButton from '@/app/components/sendMailButton';
import RemoveEmailButton from '@/app/components/RemoveEmailButton';

export default async function NewsLetter() {
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
                        Det vil kun registrere navnet på eposten din, og vil sende en epost
                        til deg hver gang klubben sender ut nyheter.
                    </p>
                </div>

                <div className="mt-4 flex justify-center">
                    <SendMailButton />
                    <RemoveEmailButton />
                </div>
            </div>
        </div>
    );
}