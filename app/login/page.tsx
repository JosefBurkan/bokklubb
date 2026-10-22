import Link from "next/link";
import DiscordLoginButton from "@/app/components/DiscordLoginButton";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--main)] px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">
          Velkommen til bokklubben
        </h1>

        <p className="mt-3 text-gray-600">
          Logg inn eller opprett en konto med Discord for å delta i
          bokklubbens aktiviteter.
        </p>

        <div className="mt-8">
          <DiscordLoginButton />
        </div>

        <Link href="/" className="mt-6 inline-block text-sm underline">
          Tilbake til forsiden
        </Link>
      </div>
    </main>
  );
}
