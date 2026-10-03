 import SendMailButton from '@/app/components/SendMailButton';

export default function prevBooksOfTheMonth() {



    return (

        <>
        <h1>
            Velkommen til arkivet med alle de tidligere bøkene
            </h1>
            
            <br />
            
            <p>Trykk på knappen for å sende epost til deg </p>
            <br/>
            <p>Funker kun om du har satt opp resend og registrert eposten din der + har den i .env fila</p>

            skrivefeltet under gjør ingenting akkurat nå, men den skal kobles opp mot resend etterhvert

            <SendMailButton />
            
        </>
    );
    
}
  