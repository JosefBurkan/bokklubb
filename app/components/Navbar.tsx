import { link } from "fs";
import Link from "next/link";

export default function Navbar() {
  const linkStyle = `
    relative
    py-2
    text-sm
    font-semibold
    text-white/90
    transition
    duration-200

    hover:text-white

    after:absolute
    after:bottom-0
    after:left-0
    after:h-[2px]
    after:w-0
    after:rounded-full
    after:bg-white
    after:transition-all
    after:duration-200

    hover:after:w-full
  `;

  return (
    <nav className="flex items-center gap-4 sm:gap-7">

      <Link
        href="/newsLetter"
        className={linkStyle}>
        
        Nyheter
      
      </Link>
      <Link
        href="/events"
        className={linkStyle}
      >
        Eventer
      </Link>

      <Link
        href="/about"
        className={linkStyle}
      >
        Om klubben
      </Link>

    </nav>
  );
}