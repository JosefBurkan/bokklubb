"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import LogoutButton from "@/app/components/LogoutButton";

const ADMIN_LINKS = [
  { href: "/admin", label: "Oversikt" },
  { href: "/admin/events", label: "Arrangementer" },
  { href: "/admin/books", label: "Bøker" },
  { href: "/admin/news-letter", label: "Nyhetsbrev" },
];

// Persistent navigation for the protected admin workspace.
export default function AdminNavigation() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/admin"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/15 bg-[#5C3C54] shadow-sm shadow-[#331F2E]/10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 md:px-8">
        {/* Admin identity and brand. */}
        <Link href="/admin" className="flex shrink-0 items-center gap-3 text-[#FCF3E5]">
          <span className="font-display text-xl font-bold">Lesely</span>
          <span className="rounded-full bg-[#F2C676] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#331F2E]">
            Admin
          </span>
        </Link>

        {/* Main admin destinations; current section is highlighted. */}
        <nav aria-label="Administrasjon" className="order-3 flex w-full items-center gap-1 overflow-x-auto pb-1 md:order-none md:w-auto md:pb-0">
          {ADMIN_LINKS.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Exit the admin area or end the current session. */}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Link
            href="/"
            className="text-xs font-semibold text-white/85 underline decoration-white/40 underline-offset-4 transition hover:text-white sm:text-sm"
          >
            Vis nettsiden
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
