import SendMailButton from '@/app/components/SendMailButton';
import RemoveMailButton from '@/app/components/RemoveEmailButton';

export default async function prevBooksOfTheMonth() {
    
    return (
        <>
            <div className="text-white">
                <br />

                <div className="p-5">

                    Skriv inn eposten din her for å signe opp til klubbens news letter!
                    Det vil kun registrere navnet på eposten din, og vil sende en epost til deg hver gang
                    klubben sender ut nyheter.

                    Du kan også melde deg ut ved å skrive inn eposten din og trykke på den røde knappen nederst

                    <p>Trykk på knappen for å sende epost til deg </p>
                </div>
            </div>


            <div className="flex justify-center items-center">

                <SendMailButton />

                <RemoveMailButton />
            </div>
        </>
    );
}