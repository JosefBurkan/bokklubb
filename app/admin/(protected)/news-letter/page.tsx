import SendNewsLetterButton from '@/app/components/SendNewsLetterButton';

export default function newsLetter()
{
    return (
        <>
            <p className="text-white text-center">
                Her kan du skrive tekst og laste opp bilder/filer som vil sendes til alle registrerte medlemmer
            </p>
            

            <div className="flex justify-center ">
                <SendNewsLetterButton />
            </div>
        </>
    )
}