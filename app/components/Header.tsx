import Link from "next/link";
import Navbar from "./Navbar";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-header">

      <div className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between gap-5 px-5 md:px-8 lg:px-12">

        <Link
          href="/"
          className="whitespace-nowrap text-base font-bold tracking-tight text-white sm:text-xl md:text-2xl"
        >
          Hjem
        </Link>

        <Navbar />

      </div>

    </header>
  );
}