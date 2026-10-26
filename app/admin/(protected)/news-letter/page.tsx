import SendNewsLetterButton from '@/app/components/SendNewsLetterButton';
import AdminBackLink from '../AdminBackLink';

export default function newsLetter()
{
    return (
        <main className="min-h-screen bg-[var(--main)] px-6 py-10">
            <div className="mx-auto max-w-6xl">
                <AdminBackLink />
                <p className="mt-8 text-center text-white">
                    Her kan du skrive tekst og laste opp bilder/filer som vil sendes til alle registrerte medlemmer
                </p>

                <div className="flex justify-center">
                    <SendNewsLetterButton />
                </div>
            </div>
        </main>
    )
}
