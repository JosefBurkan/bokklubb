import SendMailButton from '@/app/components/sendMailButton';
import RemoveEmailButton from '@/app/components/RemoveEmailButton';

export default async function prevBooksOfTheMonth() {
    
    return (
        <div className="relative overflow-hidden">
                <br />

                <div className="p-5 text-center">

                    Skriv inn eposten din her for å signe opp til klubbens news letter!
                    <br></br>
                    Det vil kun registrere navnet på eposten din, og vil sende en epost til deg hver gang
                    <br/>
                    klubben sender ut nyheter.
                </div>

            <div className="flex justify-center">

                <SendMailButton />

                <RemoveEmailButton />
                
            </div>
        </div>
    );
}