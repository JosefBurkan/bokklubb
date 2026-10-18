import SendMailButton from '@/app/components/sendMailButton';

export default async function prevBooksOfTheMonth() {
    
    return (
        <>
            <div className="text-white">
                <br />

                <div className="p-5">

                    Skriv inn eposten din her for å signe opp til klubbens news letter!
                    Det vil kun registrere navnet på eposten din, og vil sende en epost til deg hver gang
                    klubben sender ut nyheter.

                    Du kan også melde deg ut ved å skrive inn eposten din og trykke på den røde knappen nederst (ikke lagt inn enda)

                    <p>Trykk på knappen for å sende epost til deg </p>
                    <br/>
                    <p>Fungerer kun om du har satt opp resend og registrert eposten din der + har den i .env fila</p>

                    skrivefeltet under gjør ingenting akkurat nå, men den skal kobles opp mot resend etterhvert
                </div>
            </div>

            <SendMailButton />
        </>
    );
}z